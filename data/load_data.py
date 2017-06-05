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

from data import init_defaults
from data.parse_document import parse_document
from data.parse_schema import parse_schema
from data.parse_schema_v2 import parse_schema as parse_schema_v2

from thresher.models import (Project, Article, Topic, HighlightGroup,
                             ArticleHighlight, Question, Answer)

ANALYSIS_TYPES = {}
HIGH_ID = 20000

class TopicsSchemaParser(object):
    """
    Parses a json schema of topics and questions and populates the database
    """
    def __init__(self, topic_obj, schema, dependencies):
        """
        topic_obj: The Topic object that is the parent of subtopics in schema
        schema: A json schema as a string or loaded json with subtopics
        dependencies: The list of answers that point to another question
        """
        self.topic_obj = topic_obj
        # if the schema is a string, tries to load it as json, otherwise,
        # assumes it's already json
        if isinstance(schema, str) or isinstance(schema, unicode):
            self.schema_json = json.loads(schema)
        else:
            self.schema_json = schema
        # ensure that the analysis_type is valid
        if not isinstance(topic_obj, Topic):
            raise ValueError("schema must be an instance of Topic model")
        self.dep = dependencies

    def load_answers(self, answers, question):
        """
        Creates the answers instances for a given question.
        answers: A list of answers
        question: The question that answers belongs to
        """
        # find the corresponding topic and question ids
        for answer_args in answers:
            # create the next question reference, it will be rewritten in
            # load_next_question
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
            # Set reference to parent
            topic_args['parent'] = self.topic_obj
            # Create the topic with the values in topic_args
            topic = Topic.objects.create(**topic_args)
            self.load_questions(questions, topic)
        # self.load_next_question()
        # self.load_dependencies_old()

    def load_next_question(self):
        """
        Loads all mandatory next_questions to Answer objects.
        If an answer does not point to another question, that
        signals the end. Also populates each mandatory question
        with a default next question.
        """
        topics = Topic.objects.filter(parent=self.topic_obj)
        for topic in topics:
            questions = Question.objects.filter(topic=topic) \
                                        .order_by('question_number')
            for i in range(len(questions) - 1):
                self.write_answers(questions[i], questions[i + 1])

    def write_answers(self, curr_question, next_question):
        """
        Helper method for load_next_question.
        Writes the default next answer to the current question and its answers.
        curr_question: the curr_question to be modified
        next_question: the next_question curr_question should point to by
                       default
        """
        curr_question.save()
        answers = Answer.objects.filter(question=curr_question)
        for answer in answers:
            answer.next_question = next_question
            answer.save()

    def load_dependencies(self):
        """
        Loads dependencies into targeted answers.
        """
        # Report as many errors as possible to aid someone in
        # debugging a schema. Don't bail on first error.
        for dep in self.dep:
            try:
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
    schema_name = schema['title']
    # old schemas don't have a 'parent' for schemas
    if 'parent' in schema:
        schema_parent = schema['parent']
        if schema_parent:
            parent = Topic.objects.get(name=schema_parent)
        else:
            parent = None
    else:
        parent = None
    schema_obj = Topic.objects.create(
        parent=parent,
        name=schema_name,
        instructions=schema['instructions'],
        glossary=schema['glossary']
    )
    try:
        schema_obj.save()
    except ValidationError:
        # we've already loaded this schema, pull it into memory.
        print "Schema already exists. It will be overwritten"
        curr_schema_obj = Topic.objects.get(name=schema_name)
        # We can't just delete the object because this will delete all TUAs associated with it.
        # Instead, we update the Analysis Type and delete all the topics associated with it.
        # When the id is set, django automatically knows to update instead of creating a new entry.
        schema_obj.id = curr_schema_obj.id
        # Save the updated object
        schema_obj.save()
        # delete all topics associated with this Analysis Type
        # This will CASCADE DELETE all questions and answers as well
        Topic.objects.filter(parent=schema_obj).delete()

    ANALYSIS_TYPES[schema_name] = schema_obj
    print "loading schema:", schema_name

    # Load the topics, questions and answers of the schema
    schema_parser = TopicsSchemaParser(topic_obj=schema_obj,
                                       schema=schema['topics'],
                                       dependencies=schema['dependencies'])
    schema_parser.load_topics()
    schema_parser.load_dependencies()
    return schema_obj.id

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
    article_highlight = ArticleHighlight.objects.create(article=article_obj)

    for tua_type, tuas in article['tuas'].iteritems():
        try:
            topic = Topic.objects.filter(name=tua_type)[0]
            #analysis_type = (ANALYSIS_TYPES.get(tua_type) or
            #                 Topic.objects.get(name=tua_type))
        except IndexError:
            # No analysis type loaded--create a dummy type.
            topic = Topic.objects.create(
                name=tua_type,
                instructions='',
                glossary='',
            )
            ANALYSIS_TYPES[tua_type] = topic
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



def load_schema_dir(dirpath):
    schema_files = sorted(fnmatch.filter(os.listdir(dirpath), '*.txt'))
    for schema_file in schema_files:
        load_schema(parse_schema(os.path.join(dirpath, schema_file)))

def load_schema_v2_dir(dirpath):
    schema_files = sorted(fnmatch.filter(os.listdir(dirpath), '*.txt'))
    for schema_file in schema_files:
        load_schema(parse_schema_v2(os.path.join(dirpath, schema_file)))

def load_article_dir(dirpath, with_annotations=False):
    for article_filename in os.listdir(dirpath):
        if os.path.splitext(article_filename)[1] != '.txt':
            continue
        annotated_article = parse_document(os.path.join(dirpath, article_filename))
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
    init_defaults.createHighlighterProject(created_by)
    init_defaults.createQuizProject(created_by)
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
