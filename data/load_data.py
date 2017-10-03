import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "thresher_backend.settings")

import logging
logger = logging.getLogger(__name__)

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
from data.parse_schema import parse_schema, ParseSchemaException
from data.parse_schema_v2 import parse_schema as parse_schema_v2

from thresher.models import (Article, Topic, Question, Answer,
                             ArticleHighlight, HighlightGroup,
                             Contributor, ParserError)

HIGH_ID = 20000

class TopicsSchemaParser(object):
    """
    Parses a json schema of topics and questions and populates the database
    """
    def __init__(self, schema):
        """
        topic_obj: The Topic object that is the parent of subtopics in schema
        schema: A json schema as a string or loaded json with subtopics
        dependencies: The list of answers that point to another question
        """
        # if the schema is a string, tries to load it as json, otherwise,
        # assumes it's already json
        if isinstance(schema, str) or isinstance(schema, unicode):
            self.schema_json = json.loads(schema)
        else:
            self.schema_json = schema
        self.topic_obj = None

    def load_answers(self, answers, question):
        """
        Creates the answers instances for a given question.
        answers: A list of answers
        question: The question that answers belongs to
        """
        # In the Quiz front-end, tracking colors assigned to answers
        # is vastly simplified if every question can be counted on to have
        # at least one answer with a unique ID, including
        # question_type == 'TEXT', 'DATE', or 'TIME'.
        if len(answers) == 0:
            answers.append({
                'answer_number': 1,
                'question': question,
                'answer_content': 'placeholder answer for ' + question.question_type
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
            # Create the answer in the database
            answer = Answer.objects.create(**answer_args)

    def load_questions(self, questions, topic):
        """
        Creates the questions instances for the given topic.
        questions: A list of questions
        topic: The topic that questions belongs to
        """
        for question_args in questions:
            # Create the topic
            question_args['topic'] = topic
            # Store the answers for later
            answers = question_args.pop('answers')
            # Create the Question
            question = Question.objects.create(**question_args)
            # Load the Question's answers
            self.load_answers(answers, question)

    def load_topics(self):
        """
        Loads all the topics, their questions and their answers.
        """
        for topic_args in self.schema_json:
            # Get the questions to add them later
            questions = topic_args.pop('questions')
            # Change id to order
            topic_args['order'] = topic_args.pop('id')
            # now the topics each have their own dependencies
            # topics should already have their own glossary and instructions
            # Create the topic with the values in topic_args
            topic = Topic.objects.create(**topic_args)
            if self.topic_obj is None:
                try:
                    topic.save()
                except ValidationError:
                    # we've already loaded this schema, pull it into memory.
                    print "Schema already exists. It will be overwritten"
                    curr_schema_obj = Topic.objects.get(name=self.schema_json['title'])
                    # We can't just delete the object because this will delete all TUAs associated with it.
                    # Instead, we update the Analysis Type and delete all the topics associated with it.
                    # When the id is set, django automatically knows to update instead of creating a new entry.
                    topic.id = curr_schema_obj.id
                    # Save the updated object
                    topic.save()
                    # delete all topics associated with this Analysis Type
                    # This will CASCADE DELETE all questions and answers as well
                    Topic.objects.filter(parent=topic).delete()
                self.topic_obj = topic
            self.load_questions(questions, topic)

    def load_dependencies(self, dependencies):
        """
        Loads dependencies into targeted answers.
        """
        # Report as many errors as possible to aid someone in
        # debugging a schema. Don't bail on first error.
        for dep in dependencies:
            try:
                # we will not have parent topics anymore
                topic_obj = Topic.objects.get(parent=self.topic_obj,
                                              order=dep.topic)
            except Topic.DoesNotExist:
                logger.error("%s\nDidn't find topic number %d" % (dep, dep.topic,))
                continue

            try:
                question_obj = Question.objects.get(topic=topic_obj,
                                                    question_number=dep.question)
            except Question.DoesNotExist:
                logger.error("%s\nDidn't find question number %d" % (dep, dep.question,))
                continue

            try:
                next_question_obj = Question.objects.get(topic=topic_obj,
                                    question_number=dep.next_question)
            except Question.DoesNotExist:
                logger.error("%s\nDidn't find next question number %d" % (dep, dep.next_question,))
                continue

            if dep.answer == 'any':
                # Any answer to this question activates this next_question
                # Note that text box and date questions do not have
                # any Answer records to store next_questions, but still use .any
                # e.g., where T is the topic number and Q is a question number:
                # if T.Qx.any, then T.Qy
                question_obj.next_questions.append(next_question_obj.id)
                question_obj.save()
            else:
                # This answer activates this next_question
                try:
                    answer_obj = Answer.objects.get(question=question_obj,
                                                    answer_number=int(dep.answer))
                except Answer.DoesNotExist:
                    logger.error("%s\nDidn't find answer number %d" % (dep, dep.answer,))
                    continue
                answer_obj.next_questions.append(next_question_obj.id)
                answer_obj.save()

def load_schema(schema):
    # Load the topics, questions and answers of the schema
    schema_parser = TopicsSchemaParser(schema=schema['topics'])
    schema_parser.load_topics()
    schema_parser.load_dependencies(schema['dependencies'])

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
            topic = Topic.objects.create(
                name=tua_type,
                instructions='',
                glossary='',
            )
            print("made a dummy topic: %s" % tua_type)
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

def load_schema_atomic(orig_filename, actual_filepath):
    try:
        with transaction.atomic():
            load_schema(parse_schema(actual_filepath))
    except ParseSchemaException as e:
        # Log original filename, not path or secure /tmp file used by RQ worker.
        e.file_name = orig_filename
        e.log()
        save_parse_exception_message(e)

def load_schema_dir(dirpath):
    schema_files = sorted(fnmatch.filter(os.listdir(dirpath), '*.txt'))
    for schema_file in schema_files:
        print "Loading schema:", schema_file
        load_schema_atomic(schema_file, os.path.join(dirpath, schema_file))

def load_schema_v2_dir(dirpath):
    schema_files = sorted(fnmatch.filter(os.listdir(dirpath), '*.txt'))
    for schema_file in schema_files:
        with transaction.atomic():
            load_schema(parse_schema_v2(os.path.join(dirpath, schema_file)))

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
        help='Directory holding schemas in version 1 format.')
    parser.add_argument(
        '-v2', '--schema-v2-dir',
        help='Directory holding schema files in version 2 format.')
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
        print "Loading schemas in version 1 format"
        load_schema_dir(args.schema_dir)
        print "Finished loading schemas"
    if args.schema_v2_dir:
        print "Loading schemas in version 2 format"
        load_schema_v2_dir(args.schema_v2_dir)
        print "Finished loading schemas"
    if args.article_dir:
        load_article_dir(args.article_dir, args.with_annotations)
    if args.with_annotations:
        print "Loaded existing annotations: highlights for %d articles" % (
              ArticleHighlight.objects.count())
