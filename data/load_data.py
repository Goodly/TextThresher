import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "thresher_backend.settings")

import django
django.setup()

import argparse
import json
import fnmatch

from django.core.management import call_command
from django.core.management.color import no_style
from django.db import connections, DEFAULT_DB_ALIAS, models
from django.db.utils import IntegrityError
from django.core.exceptions import ValidationError

from data import init_defaults
from data.parse_document import parse_document
from data.parse_schema import parse_schema
from data.legacy.parse_schema import parse_schema as old_parse_schema

from thresher.models import (Project, Article, Topic, HighlightGroup,
                             ArticleHighlight, Question, Answer,
                             UserProfile)
from django.contrib.auth import get_user_model
User=get_user_model()

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
        for dep in self.dep:
            topic_obj = Topic.objects.filter(parent=self.topic_obj, 
                                             order=dep.topic)[0]
            question_obj = Question.objects.filter(topic=topic_obj,
                                               question_number=dep.question)[0]
            next_question_obj = Question.objects.filter(topic=topic_obj, 
                                question_number=dep.next_question)[0]
            if dep.answer == '*':
                # For the new parse_schema.py, it uses '*' for 'any' answers
                # Get all the answers of the source question
                answer_objs = Answer.objects.filter(question=question_obj)
            else:
                # Normally, we only have one answer for one Dependency
                # Still store this object in a list for code reuse
                answer_objs = Answer.objects.filter(question=question_obj, 
                                                answer_number=dep.answer)
            for answer_obj in answer_objs:
                # next_questions is an array stored as text
                next_questions_arr = answer_obj.next_questions
                next_q_id = str(next_question_obj.id)
                # Manipulate the array as text
                if next_questions_arr == "[]":
                    next_questions_arr = "[" + next_q_id + "]"
                else:
                    next_questions_arr = (next_questions_arr[:-1] + "," 
                                          + next_q_id + "]")
                answer_obj.next_questions = next_questions_arr
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
        glossary=json.dumps(schema['glossary'])
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
            max_id = Article.objects.all().order_by('-article_number')[0].article_number
            new_id = max_id + 1 if max_id >= HIGH_ID else HIGH_ID
            print "NEW ID!", new_id
        else:
            # we've already loaded this article, so don't process its TUAs.
            return

    except Article.DoesNotExist: # Not a duplicate.
        pass

    article_obj = Article(
        article_number=new_id,
        text=article['text'],
        date_published=article['metadata']['date_published'],
        city_published=article['metadata']['city'],
        state_published=article['metadata']['state'],
        periodical=article['metadata']['periodical'],
        periodical_code=int(article['metadata']['periodical_code']),
        parse_version=article['metadata']['version'],
        annotators=json.dumps(article['metadata']['annotators']),
    )
    article_obj.save()
    print "article id %d numbered %s" % (article_obj.id,
          article_obj.article_number)
    return article_obj

def load_annotations(article, article_obj):
    # In future usage, the articles being imported will not be highlighted
    # already and thus won't have 'annotators'.
    article_highlight = ArticleHighlight.objects.create(article=article_obj,
                                                        highlight_source='HLTR')

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
                highlight = HighlightGroup.objects.create(offsets=json.dumps(offset_list),
                                                          case_number=tua_id,
                                                          highlight_text="placeholder",
                                                          topic=topic,
                                                          article_highlight=article_highlight)

            except ValidationError as e:
                print 'error on article #', new_id, 'tua #', tua_id, 'of', tua_type
                print e



def load_schema_dir(dirpath):
    schema_files = sorted(fnmatch.filter(os.listdir(dirpath), '*.txt'))
    for schema_file in schema_files:
        load_schema(parse_schema(os.path.join(dirpath, schema_file)))

def load_old_schema_dir(dirpath):
    schema_files = sorted(fnmatch.filter(os.listdir(dirpath), '*.txt'))
    for schema_file in schema_files:
        load_schema(old_parse_schema(os.path.join(dirpath, schema_file)))

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
        help='The directory holding raw schema files for the TUA types')
    parser.add_argument(
        '-o', '--old-schema-dir',
        help='The directory holding old schema files')
    parser.add_argument(
        '-d', '--article-dir',
        help='directory with articles to load')
    parser.add_argument(
        '-a', '--with-annotations',
        default=False,
        action='store_true',
        help='import article annotations and add any missing topics')
    return parser.parse_args()

if __name__ == '__main__':
    init_defaults.createSuperUser()
    init_defaults.createHighlighterProject()
    init_defaults.createQuizProject()
    researchers = init_defaults.createThresherGroup()
    created_by = init_defaults.createNick(groups=[researchers])
    args = load_args()
    if args.schema_dir:
        load_schema_dir(args.schema_dir)
    if args.old_schema_dir:
        print "Loading Old Schemas"
        load_old_schema_dir(args.old_schema_dir)
        print "Finished loading schemas"
    if args.article_dir:
        load_article_dir(args.article_dir, args.with_annotations)
