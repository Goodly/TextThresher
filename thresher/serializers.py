import json
from django.contrib.auth.models import User
from rest_framework import serializers
from models import (Article, Topic, Question, Answer,
                    HighlightGroup, SubmittedAnswer, NLPHints,
                    Project, ArticleHighlight, UserProfile)


# Custom JSON field
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
        fields = ('id', 'name', 'instructions')

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
    # Keep HighlightGroup metadata
    offsets = JSONSerializerField()      # Should we use OffsetFieldSerializer instead of this?
    submitted_answers = SubmittedAnswerSerializer(many=True)

    class Meta:
        model = HighlightGroup
        fields = ('id', 'offsets', 'case_number',
                  'topic', 'submitted_answers')

class ArticleHighlightSerializer(serializers.ModelSerializer):
    highlights = HighlightGroupSerializer(many=True)

    class Meta:
        model = ArticleHighlight
        fields = ('id', 'highlights', 'created_by', 'highlight_source')

class ArticleSerializer(serializers.ModelSerializer):
    annotators = JSONSerializerField()

    class Meta:
        model = Article
        fields = ('id', 'article_number', 'text', 'date_published', 'city_published',
                  'state_published', 'periodical', 'periodical_code',
                  'parse_version', 'annotators')

class AnswerSerializer(serializers.ModelSerializer):
    next_questions = JSONSerializerField()

    class Meta:
        model = Answer
        fields = ('id', 'answer_number', 'answer_content', 'next_questions')

class QuestionSerializer(serializers.ModelSerializer):
    # A nested serializer for all the answers (if any)
    answers = AnswerSerializer(many=True)

    class Meta:
        model = Question
        fields = ('id', 'question_number', 'question_type', 'question_text',
                  'next_questions', 'answers')

    def create(self, validated_data):
        answers = validated_data.pop('answers')
        question = Question.objects.create(**validated_data)
        for answer in answers:
            Answer.objects.create(question=question, **answer)
        return question

class NLPQuestionSerializer(serializers.Serializer):
    ID = serializers.SerializerMethodField()
    Question = serializers.SerializerMethodField()

    def get_ID(self, obj):
        return obj.id

    def get_Question(self, obj):
        return obj.question_text

class UserProfileSerializer(serializers.ModelSerializer):
    # Getting info from User model
    username = serializers.SerializerMethodField()

    # Custom fields
    experience_score = serializers.DecimalField(max_digits=5, decimal_places=3)
    accuracy_score = serializers.DecimalField(max_digits=5, decimal_places=3)
    users_highlights = ArticleHighlightSerializer(many=True)
    submitted_answers = SubmittedAnswerSerializer(many=True)

    def get_username(self, obj):
        return obj.user.username

    class Meta:
        model = UserProfile
        fields = ('id', 'username',
                  'experience_score', 'accuracy_score', 'users_highlights',
                  'submitted_answers')


## Custom fields for the serializers ##

class OffsetField(serializers.Field):
#    def __init__(self, offsets, *args, **kwargs):
#        serializers.Field.__init__(*args, **kwargs)
#        self.offsets = offsets

    # Override
    def to_representation(self, obj):
        ret = {"selector": {"@type": "MultiplePositionTextSelector"}}
        ret["selector"]["offsets"] = [{"start": start, "end": end} for (start, end) in self.offsets]

        return ret

    # Override
    def to_internal_value(self, data):
        ret = json.loads(data) # Convert to Python dict
        return json.dumps(ret["offsets"]) # Convert back to native form of offsets, a JSON object



class TopicSerializer(serializers.ModelSerializer):
        # A nested serializer for all the questions
    questions = QuestionSerializer(many=True)

    glossary = JSONSerializerField()

    class Meta:
        model = Topic
        fields = ('id', 'parent', 'name',
                  'order', 'glossary', 'instructions',
                  'questions')

class RootTopicSerializer(serializers.ModelSerializer):
    glossary = JSONSerializerField()

    class Meta:
        model = Topic
        fields = ('id', 'name', 'order', 'glossary', 'instructions')

class NLPHintSerializer(serializers.ModelSerializer):
    offsets = JSONSerializerField()

    class Meta:
        model = NLPHints
        fields = ('id', 'article', 'question', 'offsets')
