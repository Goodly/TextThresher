import json
from django.contrib.auth.models import User
from rest_framework import serializers
from models import (Article, AnalysisType, TUA,
                    Topic, Question, Answer,
                    HighlightGroup, MCSubmittedAnswer,
                    DTSubmittedAnswer, CLSubmittedAnswer,
                    TBSubmittedAnswer)
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

class UserSerializer(serializers.ModelSerializer):
    password = serializers.Field(write_only=True)

    def restore_object(self, attrs, instance=None):
        if instance: # Update
            user = instance
            user.username = attrs['username']
            user.email = attrs['url']
            user.is_staff = attrs['is_staff']
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
        fields = ('id', 'username', 'email', 'is_staff', 'password')

#class serializers.ModelSerializer(serializers.ModelSerializer):
#    json_fields = [] # subclasses should assign these
#
#    def __init__(self, *args, **kwargs):
#        super(serializers.ModelSerializer, self).__init__(*args, **kwargs)
#
#        # add transformation methods for the relevant fields
#        def to_json(obj, value):
#            if not value:
#                return json.loads("{}")
#            return json.loads(value)
#
#        for field in self.json_fields:
#            setattr(self, 'transform_' + field, to_json)

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
        fields = ('id', 'answer_id', 'text')

class QuestionSerializer(serializers.ModelSerializer):
    # A nested serializer for all the answers (if any)
    answers = AnswerSerializer(many=True)

    class Meta:
        model = Question
        fields = ('id', 'question_id', 'type', 'text', 'answers')

class TopicSerializer(serializers.ModelSerializer):
    # A nested serializer for all the questions
    questions = QuestionSerializer(many=True)

    class Meta:
        model = Topic
        fields = ('id', 'topic_id', 'name', 'questions')

class AnalysisTypeSerializer(serializers.ModelSerializer):
    glossary = JSONSerializerField()
    question_dependencies = JSONSerializerField()
    #topics = JSONSerializerField()
    topics = TopicSerializer(many=True)

    class Meta:
        model = AnalysisType
        fields = ('id', 'name', 'instructions', 'glossary', 'topics',
                  'question_dependencies')

class TUASerializer(serializers.ModelSerializer):
    analysis_type = AnalysisTypeSerializer()
    article = ArticleSerializer()
    offsets = JSONSerializerField()

    class Meta:
        model = TUA
        fields = ('id', 'tua_id', 'analysis_type', 'article', 'offsets')
        #depth = 1

class MCSubmittedAnswerSerializer(serializers.ModelSerializer):
    question = serializers.PrimaryKeyRelatedField(queryset=Question.objects.all())
    answer = serializers.PrimaryKeyRelatedField(queryset=Answer.objects.all()) 

    class Meta:
        model = MCSubmittedAnswer
        fields = ('question', 'answer')

class CLSubmittedAnswerSerializer(serializers.ModelSerializer):
    question = serializers.PrimaryKeyRelatedField(queryset=Question.objects.all())
    answer = serializers.PrimaryKeyRelatedField(many=True, queryset=Answer.objects.all())

    class Meta:
         model = CLSubmittedAnswer
         fields = ('question', 'answer')
 
class TBSubmittedAnswerSerializer(serializers.ModelSerializer):
    question = serializers.PrimaryKeyRelatedField(queryset=Question.objects.all())

    class Meta:
         model = TBSubmittedAnswer
         fields = ('question', 'answer')
   
class DTSubmittedAnswerSerializer(serializers.ModelSerializer):
    question = serializers.PrimaryKeyRelatedField(queryset=Question.objects.all())

    class Meta:
         model = DTSubmittedAnswer
         fields = ('question', 'answer')

## Custom fields for the serializers ##

class GenericSubmittedAnswerField(serializers.Field):
    """
    A custom field that represents a single submitted answer
    """
    models = {"mc" : MCSubmittedAnswer,
              "cl": CLSubmittedAnswer,
              "tb" : TBSubmittedAnswer,
              "dt" : DTSubmittedAnswer}
    
    serializers = {"mc" : MCSubmittedAnswerSerializer,
                   "cl": CLSubmittedAnswerSerializer,
                   "tb" : TBSubmittedAnswerSerializer,
                   "dt" : DTSubmittedAnswerSerializer}

    def to_representation(self, obj):
        question_type = obj.question.type
        serializer = self.serializers[question_type]

        return serializer(obj).data

    def to_internal_value(self, data):
        question_id = data.get('question', None)
        try:
            question = Question.objects.get(id=question_id)
        except:
            raise serializers.ValidationError('Invalid Question ID')

        serializer = self.serializers[question.type]
        serialized_instance = serializer(data=data)
        if not serialized_instance.is_valid():
            raise serializers.ValidationError(serialized_instance.errors)
        deserialized_data = serialized_instance.validated_data
        model = self.models[question.type]

        return {'class':model, 'data':deserialized_data} 
                               

# A serializer for a highlight group
class HighlightGroupSerializer(serializers.ModelSerializer):
    # a custom field containing all the questions and answers
    questions = serializers.ListField(child=GenericSubmittedAnswerField())
    offsets = JSONSerializerField()

    class Meta:
        model = HighlightGroup
        fields = ('tua', 'offsets', 'questions')

    def create(self, validated_data):
        # Get the answers nested models
        answers = validated_data.pop('questions')

        # Remove the force_insert if it's there
        validated_data.pop('force_insert', None)

        # create the highlight group first
        highlight_group = HighlightGroup.objects.create(**validated_data)

        # Add the highlight group model to the kwargs and save
        for answer in answers:
            model = answer['class']
            kwargs = answer['data']
            # Add the highlight group instance to the kwargs
            kwargs['highlight_group'] = highlight_group
            
            # There is a special case if it's a checlist,
            # Because of the many to many relationship, this needs to be saved differently
            if model == CLSubmittedAnswer:
                # Get the answers:
                answers = kwargs.pop('answer')
                # first create the CLSubmitted answer
                submission = CLSubmittedAnswer.objects.create(**kwargs)
                # Now add the answers
                submission.answer.add(*answers)

            # For all other models, simply create the objects
            else:
                model.objects.create(**kwargs)

        return highlight_group 

