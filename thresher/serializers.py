import json
from rest_framework import serializers
from models import (Article, Topic, Question, Answer,
                    ArticleHighlight, HighlightGroup,
                    QuizTaskRun, SubmittedAnswer,
                    NLPHints, Project, Contributor)

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
        fields = ('id', 'task_type', 'short_name', 'name', 'description')

class ContributorSerializer(serializers.ModelSerializer):
    unique_label = serializers.SerializerMethodField()

    def get_unique_label(self, obj):
        if obj.username:
            return obj.username
        elif obj.pybossa_user_id:
            return str(obj.pybossa_user_id)
        else:
            return str(obj.id)

    class Meta:
        model = Contributor
        fields = ('id', 'unique_label')

class SubmittedAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubmittedAnswer
        fields = ('id', 'answer')

class HighlightGroupSerializer(serializers.ModelSerializer):
    topic_name = serializers.SerializerMethodField()
    topic_number = serializers.SerializerMethodField()

    def get_topic_name(self, obj):
        return obj.topic.name

    def get_topic_number(self, obj):
        return obj.topic.topic_number

    class Meta:
        model = HighlightGroup
        fields = ('id', 'article_highlight', 'topic',
                   'topic_name', 'topic_number',
                   'case_number', 'offsets')

class ArticleHighlightSerializer(serializers.ModelSerializer):
    highlights = HighlightGroupSerializer(many=True)
    contributor = ContributorSerializer(many=False)

    class Meta:
        model = ArticleHighlight
        fields = ('id', 'article', 'contributor', 'highlights')

class ArticleSerializer2(serializers.ModelSerializer):
    highlight_taskruns = ArticleHighlightSerializer(many=True)

    class Meta:
        model = Article
        fields = ('id', 'article_number', 'text', 'metadata',
                  'highlight_taskruns')

class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = ('id', 'article_number', 'text', 'metadata')

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ('id', 'answer_number', 'answer_content', 'next_questions',
                  'options')

class QuestionSerializer(serializers.ModelSerializer):
    # A nested serializer for all the answers (if any)
    answers = AnswerSerializer(many=True)

    class Meta:
        model = Question
        fields = ('id', 'question_number', 'question_type', 'question_text',
                  'next_questions', 'hint_type', 'answers')

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
                  'topic_number', 'glossary', 'instructions',
                  'questions')

class RootTopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ('id', 'name', 'topic_number', 'glossary', 'instructions')

class NLPHintSerializer(serializers.ModelSerializer):
    class Meta:
        model = NLPHints
        fields = ('id', 'article', 'hint_type', 'offsets')
