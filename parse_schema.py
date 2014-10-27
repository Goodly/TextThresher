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
    def __init__(self, schema, analysis_type):
        """
        schema: a json schema as a string or loaded json
        analysis_type: the AnalysisType Model Object
        """
        # if the schema is a string, tries to load it as json, otherwise,
        # assumes it's already json
        self.schema_json = json.loads(schema) if (isinstance(schema, str) or isinstance(schema, unicode)) else schema
        
        # ensure that the analysis_type is valid
        if not isinstance(analysis_type, AnalysisType):
            raise ValueError("analysis_type must be an instance of AnalysisType\
                    model")
        self.analysis_type = analysis_type
    
    def load_answers(self, answers, question):
        """
        Creates the answers instances for a given question
        """
        for answer_args in answers:
            # rename the id to answer_id
            answer_args['answer_id'] = answer_args.pop('id')
            # create the question reference
            answer_args['question'] = question

            # Create the answer in the database
            answer = Answer.objects.create(**answer_args)

    
    def load_questions(self, questions, topic):
        """
        Creates the questions instances for the given topic
        """
        for question_args in questions:
            # rename the id to question_id
            question_args['question_id'] = question_args.pop('id')
            # remove the answers to be loaded after
            answers = question_args.pop('answers')
            # Add the topic reference
            question_args['topic'] = topic
            
            print question_args
            # Create the question
            question = Question.objects.create(**question_args)
            
            # Load its answers
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
            # set the analysis type
            topic_args['analysis_type'] = self.analysis_type
            
            # Create the topic with the values in topic_args
            topic = Topic.objects.create(**topic_args)

            self.load_questions(questions, topic)

