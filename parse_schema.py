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
        self.load_next_question()
        self.load_dependencies()

    def load_next_question(self):
        """
        Loads all mandatory next_questions to Answer objects. 
        If an answer does not point to another question, that 
        signals the end. Also populates each mandatory question 
        with a default next question.
        """
        topics = Topic.objects.filter(parent=self.topic_obj)
        for topic in topics:
            questions = Question.objects.filter(topic=topic, 
                                                contingency=False) \
                                        .order_by('question_id')
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
        curr_question.default_next = next_question
        curr_question.save()
        answers = Answer.objects.filter(question=curr_question)
        for answer in answers:
            answer.next_question = next_question
            answer.save()

    def load_dependencies(self):
        """
        Loads dependencies into targeted answers.
        """
        topics = Topic.objects.filter(parent=self.topic_obj)
        for dep in self.dep:
            topic = topics.filter(order=dep.topic)
            question = Question.objects.filter(topic=topic, 
                                               question_id=dep.question)[0]
            answers = Answer.objects.filter(
                question=question)
            next_question = Question.objects.filter(
                topic=topic, question_id=dep.next_question)[0]
            next_question_answers = Answer.objects.filter(
                question=next_question)
            
            next_question.default_next = question.default_next
            next_question.save()

            # First we populate the contingency question's answers with the
            # default next answer
            for answer in next_question_answers:
                answer.next_question = next_question.default_next
                answer.save()

            # Now we point the current question's answer to the next question
            if dep.answer == '*':
                answers = answers
            else:
                answers = answers.filter(answer_id=dep.answer)
            for answer in answers:
                answer.next_question = next_question
                answer.save()
