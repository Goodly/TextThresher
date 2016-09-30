import json
from django.contrib.auth.models import User
from rest_framework import serializers
from models import (Article, Topic, Question, Answer,
                    HighlightGroup, SubmittedAnswer,
                    Client, ArticleHighlight, UserProfile)


# Custom JSON field
class JSONSerializerField(serializers.Field):
    """
    A field which seralizes text fields into valid JSON
    """
    def to_representation(self, obj):
        if obj:
            return json.loads(obj)

        else:
            return {}

    def to_internal_value(self, data):
        return json.dumps(data)


# Serializers define the API representation of the models.

class ClientSerializer(serializers.ModelSerializer):

    class Meta:
        model = Client
        fields = ('name', 'topic')

class ArticleSerializer(serializers.ModelSerializer):
    annotators = JSONSerializerField()

    class Meta:
        model = Article
        fields = ('article_id', 'text', 'date_published', 'city_published',
                  'state_published', 'periodical', 'periodical_code',
                  'parse_version', 'annotators')

class AnswerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Answer
        fields = ('id', 'answer_id', 'answer_content', 'next_question')

class QuestionSerializer(serializers.ModelSerializer):
    # A nested serializer for all the answers (if any)
    answers = AnswerSerializer(many=True)

    class Meta:
        model = Question
        fields = ('id', 'question_id', 'question_text', 'answers')

    def create(self, validated_data):
        answers = validated_data.pop('answers')
        question = Question.objects.create(**validated_data)
        for answer in answers:
            Answer.objects.create(question=question, **answer)
        return question

class UserSerializer(serializers.ModelSerializer):
    password = serializers.Field(write_only=True)
    experience_score = serializers.DecimalField(max_digits=5, decimal_places=3)
    accuracy_score = serializers.DecimalField(max_digits=5, decimal_places=3)

    def restore_object(self, attrs, instance=None):
        if instance: # Update
            user = instance
            user.username = attrs['username']
            user.email = attrs['url']
            user.is_staff = attrs['is_staff']
            user.topic = None
            user.experience_score = 0.0
            user.accuracy_score = 0.0
        else: # Creation
            user = User(username=attrs['username'],
                        email=attrs['email'],
                        is_staff=attrs['is_staff'],
                        is_active=True,
                        is_superuser=False)

        user.set_password(attrs['password'])
        return user

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_staff', 'password', 
                  'experience_score', 'accuracy_score')

class SubmittedAnswerSerializer(serializers.ModelSerializer):
    question = serializers.PrimaryKeyRelatedField(queryset=Question.objects.all())
    answer = serializers.PrimaryKeyRelatedField(queryset=Answer.objects.all()) 
    user = UserSerializer()

    class Meta:
        model = SubmittedAnswer
        fields = ('question', 'answer', 'user', 'highlight_group')

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        highlight_data = validated_data.pop('highlight_group')
        submitted_answer = SubmittedAnswer.objects.create(**validated_data)
        highlight_group = HighlightGroup.objects.update(submitted_answer=submitted_answer, **highlight_data)
        user = UserProfile.objects.update(submitted_answer=submitted_answer, **user_data)
        return submitted_answer
                               
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

class HighlightGroupSerializer(serializers.ModelSerializer):
    # W3 Annotation Data Model properties
#    def __init__(self, offsets=[], **kwargs):
#        serializers.Serializer.__init__(self, **kwargs)
#        target = OffsetField(offsets)


    # Keep HighlightGroup metadata
    offsets = JSONSerializerField()

    class Meta:
        model = HighlightGroup
        fields = ('offsets', 'questions')

class ArticleHighlightSerializer(serializers.ModelSerializer):
    article = ArticleSerializer()
    highlight = HighlightGroupSerializer()
    class Meta:
        model = ArticleHighlight
        fields = ('article', 'highlight')

class TopicSerializer(serializers.ModelSerializer):
        # A nested serializer for all the questions
    related_questions = QuestionSerializer(many=True)

    glossary = JSONSerializerField()

    article_highlight = ArticleHighlightSerializer(many=True)

    class Meta:
        model = Topic
        fields = ('id', 'parent', 'name',
                  'order', 'glossary', 'instructions', 
                  'related_questions', 'article_highlight')

class RootTopicSerializer(serializers.ModelSerializer):
    glossary = JSONSerializerField()

    class Meta:
        model = Topic
        fields = ('id', 'name', 'order', 'glossary', 'instructions')
