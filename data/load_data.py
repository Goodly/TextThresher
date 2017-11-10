import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "thresher_backend.settings")

import logging
logger = logging.getLogger(__name__)
import pytz, datetime

import django
django.setup()

import argparse
import json
import fnmatch
from datetime import date

from django.core.management import call_command
from django.core.management.color import no_style
from django.db.utils import IntegrityError
from django.core.exceptions import ValidationError

from django.db.models import Max
from django.db import transaction

from data import init_defaults
from data.parse_document import parse_document
from data.parse_schema import parse_schema, ParseSchemaException, OPTION_TYPES

from thresher.models import (Article, Topic, Question, Answer,
                             ArticleHighlight, HighlightGroup,
                             Contributor, ParserError)

HIGH_ID = 20000

class SchemaLoadError(Exception):
    pass

def load_answers(answers, question):
    """
    Creates the answers instances for a given question.
    answers: A list of answers
    question: The question that answers belongs to
    """
    # In the Quiz front-end, tracking colors assigned to answers
    # is vastly simplified if every question can be counted on to have
    # at least one answer with a unique ID, including
    # question_type == 'TEXT', 'DATE', or 'TIME'.
    empty_options = {}
    for option_type in OPTION_TYPES.values():
        empty_options[option_type] = False

    if len(answers) == 0:
        answers.append({
            'answer_number': 1,
            'question': question,
            'answer_content': 'placeholder answer for ' + question.question_type,
            'options': empty_options
        })
        if question.question_type in ['RADIO', 'CHECKBOX']:
            logger.error("Question number {} of type {} in topic '{}' "
                         "should have answers."
                         .format(question.question_number,
                                 question.question_type,
                                 question.topic.name
                         )
            )

    # find the corresponding topic and question ids
    for answer_args in answers:
        answer_args['question'] = question
        answer_args['options'] = empty_options
        # Create the answer in the database
        answer = Answer.objects.create(**answer_args)
        answer_args['id'] = answer.id

def load_questions(questions, topic):
    """
    Creates the questions instances for the given topic.
    questions: A list of questions
    topic: The topic that questions belongs to
    """
    for question_args in questions:
        # Create the topic
        question_args['topic'] = topic
        # Set answers aside, put them back after creating question
        answers = question_args.pop('answers')
        # Create the Question
        question = Question.objects.create(**question_args)
        question_args['id'] = question.id
        # Load the Question's answers
        load_answers(answers, question)
        # Restore answers, now with ids
        question_args['answers'] = answers

def load_topics(topics):
    """
    Loads all the topics, their questions and their answers.
    Replaces schema ids with actual database ids
    """
    root_topic = None
    for topic_args in topics:
        # Set questions aside, put them back after creating topic
        questions = topic_args.pop('questions')
        # Set reference to parent (will be None for first topic...)
        topic_args['parent'] = root_topic
        # topics should already have their own glossary and instructions
        # Create the topic with the values in topic_args
        topic, created = Topic.objects.get_or_create(
            name=topic_args['name'],
            parent=topic_args['parent'],
            defaults=topic_args
        )
        # If reloading a root topic, cascade delete prior
        # subtopics, questions and answers.
        # But Submitted Answers are protected, so if any have been
        # loaded for this schema, the deletion will fail.
        if root_topic is None and not created:
            Question.objects.filter(topic=topic).delete()
            Topic.objects.filter(parent=topic).delete()

        topic_args['id'] = topic.id
        if root_topic is None:
            root_topic = topic
        load_questions(questions, topic)
        # Restore questions, now with ids
        topic_args['questions'] = questions

    return root_topic

# Create a dict of dicts for looking up database ids for Questions
# using its topic number and question number, e.g. 2.04
def make_lookup_topic_id(schema):
    lookup_topic_id = {}
    for topic_args in schema['topics']:
        lookup_topic_id[topic_args['topic_number']] = topic_args['id']
    return lookup_topic_id

# Return a dictionary keyed on topic id, return an array of question ids in that topic
def make_lookup_question_id(schema):
    lookup_question_id = {}
    for topic_args in schema['topics']:
        topic_number = topic_args['topic_number']
        lookup_question_id.setdefault(topic_number, {})
        for question_args in topic_args['questions']:
            question_number = question_args['question_number']
            lookup_question_id[topic_number][question_number] = question_args['id']
    return lookup_question_id

# Compute three sets:
# The set of all question IDs
# the set of all questions mentioned in 'next_questions' fields
# and return the set difference:
# noncontingent = allQuestions - contingent
def find_noncontingent_questions(schema, lookup_question_id):
    all_questions = set()
    for topic_args in schema['topics']:
        for question_args in topic_args['questions']:
            all_questions.add(question_args['id'])

    contingent = set()
    for dep in schema['dependencies']:
        if dep.next_question != '*':
            try:
                question_id = lookup_question_id[dep.next_topic][dep.next_question]
                contingent.add(question_id)
            except KeyError:
                raise SchemaLoadError("Line {}: Didn't find id for question number {}.{}"
                                      .format(dep.linnum, dep.next_topic, dep.next_question))

    # compute set difference
    noncontingent = all_questions - contingent
    return noncontingent

# Return a dictionary keyed on topic id, for each topic return an array of
# the NON-CONTINGENT question ids in that topic
def make_question_lists(schema, noncontingent):
    nc_questions_by_topic_id = {}
    for topic_args in schema['topics']:
        question_ids = set()
        for question_args in topic_args['questions']:
            question_ids.add(question_args['id'])
        # compute set intersection
        nc_questions_by_topic_id[topic_args['id']] = question_ids & noncontingent
        logger.info("Non-contingent questions for {} {}"
                    .format(topic_args['topic_number'], topic_args['name']))
        logger.info(question_ids & noncontingent)
    return nc_questions_by_topic_id

def load_dependencies(schema):
    """
    Loads dependencies into targeted answers.
    Must cover these scenarios:

    if 1.01.05, then 1.02
    Dependency(topic='1', question='1', answer='05', next_topic='1', next_question='2'),

    if 1.03.*, then 1.04
    Dependency(topic='1, question='3', answer='*', next_topic='1', next_question='4')

    if 0.01.01, then 1.*
    Dependency(topic='0', question='1', answer='01', next_topic='1', next_question='*')
    """

    # The schema dependencies data structure uses topic and question
    # identifiers like '2' or '2.04' that need to be translated to database ids.
    lookup_topic_id = make_lookup_topic_id(schema)
    lookup_question_id = make_lookup_question_id(schema)
    noncontingent = find_noncontingent_questions(schema, lookup_question_id)
    nc_questions_by_topic_id = make_question_lists(schema, noncontingent)

    for dep in schema['dependencies']:
        question_obj = None
        answer_obj = None
        try:
            question_id = lookup_question_id[dep.topic][dep.question]
        except KeyError:
            raise SchemaLoadError("Line {}: Didn't find id for question number {}.{}"
                                  .format(dep.linenum, dep.topic, dep.question))
        # If answer is a wildcard, look up the question, else the answer
        if dep.answer == '*':
            # if Tx.Qx.*
            try:
                question_obj = Question.objects.get(id=question_id)
            except Question.DoesNotExist:
                raise SchemaLoadError("Line {}: Didn't find question number {}"
                                      .format(dep.linenum, dep.question))
        else:
            # if Tx.Qx.A
            try:
                answer_obj = Answer.objects.get(question_id=question_id,
                                                answer_number=int(dep.answer))
            except Answer.DoesNotExist:
                raise SchemaLoadError("Line {}: Didn't find answer number {}"
                                      .format(dep.linenum, dep.answer))

        if dep.next_question == '*':
            # then Ty.*
            next_question_id = None
        else:
            # then Ty.Qy
            try:
                next_question_id = lookup_question_id[dep.next_topic][dep.next_question]
            except KeyError:
                raise SchemaLoadError("Line {}: Didn't find id for question number {}.{}"
                                      .format(dep.linenum, dep.next_topic, dep.next_question))

        if answer_obj and next_question_id:
            # if Tx.Qx.A, then Ty.Qy
            answer_obj.next_questions.append(next_question_id)
            answer_obj.save()
        elif not answer_obj and next_question_id:
            # if Tx.Qx.*, then Ty.Qy
            question_obj.next_questions.append(next_question_id)
            question_obj.save()
        elif answer_obj and not next_question_id:
            # if Tx.Qx.A, then Ty.*
            next_topic_id = lookup_topic_id[dep.next_topic]
            next_questions = nc_questions_by_topic_id[next_topic_id]
            answer_obj.next_questions.extend(next_questions)
            answer_obj.save()
        else:
            raise SchemaLoadError("Line {}: Invalid 'if' clause.".format(dep))

def load_options(schema, root_topic):
    for option in schema['options']:
        if root_topic.topic_number == option.topic:
            topic_obj = root_topic
        else:
            try:
                topic_obj = Topic.objects.get(parent=root_topic,
                                              topic_number=option.topic)
            except Topic.DoesNotExist:
                logger.error("%s\nDidn't find topic number %d" % (option, option.topic,))
                continue
        try:
            question_obj = Question.objects.get(topic=topic_obj,
                                                question_number=option.question)
        except Question.DoesNotExist:
            logger.error("%s\nDidn't find question number %d" % (option, option.question,))
            continue
        try:
            answer_obj = Answer.objects.get(question=question_obj,
                                            answer_number=int(option.answer))
        except Answer.DoesNotExist:
            logger.error("%s\nDidn't find answer number %d" % (option, option.answer,))
            continue

        answer_obj.options[option.option] = True
        answer_obj.save()

def load_schema(schema):
    # Load the topics, questions and answers of the schema
    root_topic = load_topics(schema['topics'])
    load_dependencies(schema)
    load_options(schema, root_topic)

def load_article(article):
    new_id = int(article['metadata']['article_number'])

    try: # Catch duplicate article ids and assign new ids.
        existing_article = Article.objects.get(article_number=new_id)
        if article['text'] != existing_article.text:
            old_id = new_id
            max_id = (Article.objects.all().aggregate(Max('article_number'))
                      ['article_number__max'])
            new_id = max_id + 1 if max_id >= HIGH_ID else HIGH_ID
            logger.warn("Article ID {} already assigned. New id is {}. "
                        "Recommend fixing source data".format(old_id, new_id))
        else:
            # we've already loaded this article, so don't process its TUAs.
            return

    except Article.DoesNotExist: # Not a duplicate.
        pass

    date_published=article['metadata']['date_published']
    if isinstance(date_published, date):
        # JSON Serializer doesn't like dates
        article['metadata']['date_published']=date_published.isoformat()
    article_obj = Article(
        article_number=new_id,
        text=article['text'],
        metadata=article['metadata']
    )
    article_obj.save()
    print "article id %d numbered %s" % (article_obj.id,
          article_obj.article_number)
    return article_obj

def load_annotations(article, article_obj):
    # In future usage, the articles being imported will not be highlighted
    # already and thus won't have 'annotators'.
    annotators = ','.join(article['metadata']['annotators'])
    if annotators == "":
        annotators = "Unknown annotator"

    (contributor, created) = Contributor.objects.get_or_create(
        username=annotators
    )

    article_highlight = ArticleHighlight.objects.create(article=article_obj,
                                                        contributor=contributor)
    for tua_type, tuas in article['tuas'].iteritems():
        try:
            topic = Topic.objects.filter(name=tua_type)[0]
        except IndexError:
            # No analysis type loaded--create a dummy type.
            last_number = Topic.objects.aggregate(Max('topic_number'))
            next_number = last_number['topic_number__max'] + 1
            topic = Topic.objects.create(
                name=tua_type,
                topic_number=next_number,
                instructions='',
                glossary='',
            )
            print("No match for existing topic, so made a dummy topic: %s" % tua_type)
#           raise ValueError("No TUA type '" + tua_type +
#                            "' registered. Have you loaded the schemas?")

        for tua_id, offset_list in tuas.iteritems():
            try:
                highlight = HighlightGroup.objects.create(offsets=offset_list,
                                                          case_number=tua_id,
                                                          topic=topic,
                                                          article_highlight=article_highlight)

            except ValidationError as e:
                print 'error on article #', new_id, 'tua #', tua_id, 'of', tua_type
                print e

def save_parse_exception_message(e):
    # This cannot be a method of parse_schema.ParseSchemaException because
    # parse_schema.py must be able to run at the command line without
    # Django dependencies.
    ParserError.objects.create(message=e.message, errtype=e.errtype,
                               file_name=e.file_name, linenum=e.linenum,
                               timestamp=e.timestamp)

def save_exception_message(e, orig_filename):
    timestamp = datetime.datetime.now(pytz.utc)
    logger.error("{} while loading {} at {:%Y-%m-%d %H:%M:%S %Z}"
                 .format(e.message, orig_filename, timestamp))
    ParserError.objects.create(message=e.message,
                               file_name=orig_filename, linenum=0,
                               timestamp=timestamp)

def load_schema_atomic(orig_filename, actual_filepath):
    try:
        with transaction.atomic():
            load_schema(parse_schema(actual_filepath))
    except ParseSchemaException as e:
        # Log original filename, not path or secure /tmp file used by RQ worker.
        e.file_name = orig_filename
        e.log()
        save_parse_exception_message(e)
    except SchemaLoadError as e:
        save_exception_message(e, orig_filename)
    except ValidationError as e:
        save_exception_message(e, orig_filename)

def load_schema_dir(dirpath):
    schema_files = sorted(fnmatch.filter(os.listdir(dirpath), '*.txt'))
    for schema_file in schema_files:
        print "Loading schema:", schema_file
        load_schema_atomic(schema_file, os.path.join(dirpath, schema_file))

def load_article_dir(dirpath, with_annotations=False):
    for article_filename in os.listdir(dirpath):
        if os.path.splitext(article_filename)[1] != '.txt':
            continue
        fullpath = os.path.join(dirpath, article_filename)
        with transaction.atomic():
            annotated_article = parse_document(fullpath, article_filename)
            article_obj = load_article(annotated_article)
            if with_annotations:
                load_annotations(annotated_article, article_obj)

def load_args():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '-s', '--schema-dir',
        help='Directory holding schemas in version 3 format.')
    parser.add_argument(
        '-d', '--article-dir',
        help='Directory with articles to load')
    parser.add_argument(
        '-a', '--with-annotations',
        default=False,
        action='store_true',
        help='import article annotations and add any missing topics')
    return parser.parse_args()

if __name__ == '__main__':
    init_defaults.createSuperUser()
    researchers = init_defaults.createThresherGroup()
    created_by = init_defaults.createNick(groups=[researchers])
    args = load_args()
    if args.schema_dir:
        print "Loading schemas in version 3 format"
        load_schema_dir(args.schema_dir)
        print "Finished loading schemas"
    if args.article_dir:
        load_article_dir(args.article_dir, args.with_annotations)
    if args.with_annotations:
        print "Loaded existing annotations: highlights for %d articles" % (
              ArticleHighlight.objects.count())
