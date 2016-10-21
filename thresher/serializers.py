import json
from django.contrib.auth.models import User
from rest_framework import serializers
from models import (Article, Topic, Question, Answer,
                    HighlightGroup, SubmittedAnswer,
                    Project, ArticleHighlight, UserProfile)


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

class ProjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project
        fields = ('name', 'instructions')

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
        fields = ('id', 'offsets', 'case_number', 'highlight_text', 'submitted_answers')

class ArticleHighlightSerializer(serializers.ModelSerializer):
    highlights = HighlightGroupSerializer(many=True)

    class Meta:
        model = ArticleHighlight
        fields = ('id', 'highlights', 'highlight_source')

class ArticleSerializer(serializers.ModelSerializer):
    annotators = JSONSerializerField()
    highlight_groups = ArticleHighlightSerializer(many=True)

    class Meta:
        model = Article
        fields = ('id', 'article_number', 'text', 'date_published', 'city_published',
                  'state_published', 'periodical', 'periodical_code',
                  'parse_version', 'annotators', 'highlight_groups')

class AnswerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Answer
        fields = ('id', 'answer_number', 'answer_content', 'next_question')

class QuestionSerializer(serializers.ModelSerializer):
    # A nested serializer for all the answers (if any)
    answers = AnswerSerializer(many=True)
    submitted_answers = SubmittedAnswerSerializer(many=True)

    class Meta:
        model = Question
        fields = ('id', 'question_number', 'question_type', 'question_text', 'answers')

    def create(self, validated_data):
        answers = validated_data.pop('answers')
        question = Question.objects.create(**validated_data)
        for answer in answers:
            Answer.objects.create(question=question, **answer)
        return question

class UserProfileSerializer(serializers.ModelSerializer):
    # Getting info from User model
    username = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    is_staff = serializers.SerializerMethodField()
    password = serializers.SerializerMethodField()

    # Custom fields
    experience_score = serializers.DecimalField(max_digits=5, decimal_places=3)
    accuracy_score = serializers.DecimalField(max_digits=5, decimal_places=3)
    article_highlights = ArticleHighlightSerializer(many=True)
    submitted_answers = SubmittedAnswerSerializer(many=True)
    

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

    def get_username(self, obj):
        return obj.user.username

    def get_email(self, obj):
        return obj.user.email

    def get_is_staff(self, obj):
        return obj.user.is_staff

    def get_password(self, obj):
        return obj.user.password

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_staff', 'password', 
                  'experience_score', 'accuracy_score', 'article_highlights',
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
    related_questions = QuestionSerializer(many=True)

    glossary = JSONSerializerField()

    article_highlights = ArticleHighlightSerializer(many=True)

    class Meta:
        model = Topic
        fields = ('id', 'parent', 'name',
                  'order', 'glossary', 'instructions', 
                  'related_questions', 'article_highlights')

class RootTopicSerializer(serializers.ModelSerializer):
    glossary = JSONSerializerField()

    class Meta:
        model = Topic
        fields = ('id', 'name', 'order', 'glossary', 'instructions')
