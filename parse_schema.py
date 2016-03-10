# A parser to parse the topics and questions schema for a single Analysis Type
# and populate the database

import json

from thresher.models import *

###### EXCEPTIONS ######

########################

class TopicsSchemaParser(object):
    """
    Parses a json schema of topics and questions and populates the database
    """
    def __init__(self, schema, dep, parent):
        """
        schema: a json schema as a string or loaded json
        dep: the list of answers that point to another question
        parent: the Topic object that is the parent of this schema
        """
        # if the schema is a string, tries to load it as json, otherwise,
        # assumes it's already json
        self.schema_json = json.loads(schema) if (isinstance(schema, str) or isinstance(schema, unicode)) else schema
        # ensure that the analysis_type is valid
        if not isinstance(analysis_type, Topic):
            raise ValueError("analysis_type must be an instance of Topic\
                    model")
        self.parent = parent
        self.dep = dependencies

    def clean_dependencies(self):
        """
        Returns a list of named tuples that represent each dependency:
        [Dependency(topic, question, answer, next_topic, next_topic)]
        Also converts strings to integers.
        """
        Dependency = namedtuple('Dependency', ['topic', 'question', 'answer', 'next_topic', 'next_question'])
        clean_dep = []
        for dep in self.dep:
            new_dep = dep[0].split(".")
            new_dep.extend(dep[1].split("."))
            new_dep = [int(val) for val in new_dep]
            clean_dep.append(Dependency(*new_dep))
        self.dep = clean_dep

    def load_answers(self, answers, question):
        """
        Creates the answers instances for a given question
        """
        # find the corresponding topic and question ids
        topic_id = question.topic_id
        question_id = question.question_id
        topic_dep = [d for d in clean_dep if d[0][0] == topic_id]
        question_dep = [d for d in topic_dep if d[0][1] == question_id]

        for answer_args in answers:
            # rename the id to answer_id
            answer_args['answer_id'] = answer_args.pop('id')
            # rename text to answer_content
            answer_args['answer_content'] = answer_args.pop('text')
            # create the question reference
            answer_args['question_id'] = question
            
            # check if there is a dependency
            answer_dep = [d for d in question_dep if d[0][2] == answer_args['answer_id']]
            if answer_dep:
                answer_args['next_question_id'] = answer_dep[0][1][1]

            # Create the answer in the database
            answer = Answer.objects.create(**answer_args)

    def load_questions(self, questions, topic):
        """
        Creates the questions instances for the given topic
        """
        for question_args in questions:
            # rename the id to question_id
            question_args['question_id'] = question_args.pop('id')
            # rename text to question_text
            question_args['question_text'] = question_args.pop('text')
            # remove the answers to be loaded after
            answers = question_args.pop('answers')

            # Create the Question
            question = QuestionContent.objects.create(**question_args)
            
            # Create the QuestionUnderTopic
            QuestionUnderTopic.objects.create(topic_id=topic, question_id=question, order=question.question_id)

            # Load the question's answers
            self.load_answers(answers, question)

    def load_topics(self):
        """
        loads all the topics, their questions and their answers
        """
        for topic_args in self.schema_json:
            # get the questions to add them later
            questions = topic_args.pop('questions')
            # replace id with topic_id
            topic_args['topic_id'] = topic_args.pop('id')
            # set the analysis type - not necessary, getting refactored into Topic
            # topic_args['analysis_type'] = self.analysis_type
            # set reference to parent
            topic_args['parent_id'] = parent
            
            # Create the topic with the values in topic_args
            topic = Topic.objects.create(**topic_args)

            self.load_questions(questions, topic)

