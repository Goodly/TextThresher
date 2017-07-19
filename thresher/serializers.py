import json
from rest_framework import serializers
from models import (Article, Topic, Question, Answer,
                    HighlightGroup, SubmittedAnswer, NLPHints,
                    Project, ArticleHighlight, UserProfile)


# Custom JSON field
# All JSON now using native JSONB fields in Postgres.
# Just keeping this function for reference.
class JSONSerializerField(serializers.Field):
    """
    A field which seralizes text fields into valid JSON
    """
    def to_representation(self, obj):
        if obj:
            try:
                return json.loads(obj)
            except ValueError:
                if obj[0:1] == '[':
                    return []
        return {}

    def to_internal_value(self, data):
        return json.dumps(data)


# Serializers define the API representation of the models.

class ProjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project
        fields = ('id', 'name', 'description')

class SubmittedAnswerSerializer(serializers.ModelSerializer):

    class Meta:
        model = SubmittedAnswer
        fields = ('id', 'answer')

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        highlight_data = validated_data.pop('highlight_group')
        submitted_answer = SubmittedAnswer.objects.create(**validated_data)
        highlight_group = HighlightGroup.objects.update(submitted_answer=submitted_answer, **highlight_data)
        user = UserProfile.objects.update(submitted_answer=submitted_answer, **user_data)
        return submitted_answer

class HighlightGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = HighlightGroup
        fields = ('id', 'offsets', 'case_number', 'topic')

class ArticleHighlightSerializer(serializers.ModelSerializer):
    highlights = HighlightGroupSerializer(many=True)

    class Meta:
        model = ArticleHighlight
        fields = ('id', 'highlights', 'created_by')

class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = ('id', 'article_number', 'text', 'metadata')

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ('id', 'answer_number', 'answer_content', 'next_questions')

class QuestionSerializer(serializers.ModelSerializer):
    # A nested serializer for all the answers (if any)
    answers = AnswerSerializer(many=True)

    class Meta:
        model = Question
        fields = ('id', 'question_number', 'question_type', 'question_text',
                  'next_questions', 'hint_type', 'answers')

    def create(self, validated_data):
        answers = validated_data.pop('answers')
        question = Question.objects.create(**validated_data)
        for answer in answers:
            Answer.objects.create(question=question, **answer)
        return question


# Used to export questions in format recognized by NLP-Hints program
class NLPQuestionSerializer(serializers.Serializer):
    ID = serializers.SerializerMethodField()
    Question = serializers.SerializerMethodField()

    def get_ID(self, obj):
        return obj.id

    def get_Question(self, obj):
        return obj.hint_type


class TopicSerializer(serializers.ModelSerializer):
    # A nested serializer for all the questions
    questions = QuestionSerializer(many=True)

    class Meta:
        model = Topic
        fields = ('id', 'parent', 'name',
                  'order', 'glossary', 'instructions',
                  'questions')

class RootTopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ('id', 'name', 'order', 'glossary', 'instructions')

class NLPHintSerializer(serializers.ModelSerializer):
    class Meta:
        model = NLPHints
        fields = ('id', 'article', 'hint_type', 'offsets')
