import json
from django.contrib.auth.models import User
from rest_framework import serializers
from models import (Article, Topic, Question, Answer,
                    HighlightGroup, MCSubmittedAnswer,
                    DTSubmittedAnswer, CLSubmittedAnswer,
                    TBSubmittedAnswer, Client)
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
        fields = ('id', 'question_id', 'type', 'question_text', 'answers')

class TopicSerializer(serializers.ModelSerializer):
    # A nested serializer for all the questions
    related_questions = QuestionSerializer(many=True)

    # Nested serializer for all clients associated with a topic
    clients = ClientSerializer(many=True)

    glossary = JSONSerializerField()

    highlight = fields.Nested('HighlightGroupSerializer')

    class Meta:
        model = Topic
        fields = ('id', 'parent', 'name', 'article', 'highlight',
                  'order', 'glossary', 'instructions', 
                  'related_questions', 'clients')

class UserSerializer(serializers.ModelSerializer):
    password = serializers.Field(write_only=True)
    experience_score = serializers.DecimalField(max_digits=5, decimal_places=3)
    accuracy_score = serializers.DecimalField(max_digits=5, decimal_places=3)
    topic = TopicSerializer(many=True)

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
                  'experience_score', 'accuracy_score', 'topic')

class MCSubmittedAnswerSerializer(serializers.ModelSerializer):
    question = serializers.PrimaryKeyRelatedField(queryset=Question.objects.all())
    answer = serializers.PrimaryKeyRelatedField(queryset=Answer.objects.all()) 
    user = UserSerializer()

    class Meta:
        model = MCSubmittedAnswer
        fields = ('question', 'answer', 'user')

class CLSubmittedAnswerSerializer(serializers.ModelSerializer):
    question = serializers.PrimaryKeyRelatedField(queryset=Question.objects.all())
    answer = serializers.PrimaryKeyRelatedField(many=True, queryset=Answer.objects.all())
    user = UserSerializer()

    class Meta:
         model = CLSubmittedAnswer
         fields = ('question', 'answer', 'user')
 
class TBSubmittedAnswerSerializer(serializers.ModelSerializer):
    question = serializers.PrimaryKeyRelatedField(queryset=Question.objects.all())
    user = UserSerializer()

    class Meta:
         model = TBSubmittedAnswer
         fields = ('question', 'answer', 'user')
   
class DTSubmittedAnswerSerializer(serializers.ModelSerializer):
    question = serializers.PrimaryKeyRelatedField(queryset=Question.objects.all())
    user = UserSerializer()

    class Meta:
         model = DTSubmittedAnswer
         fields = ('question', 'answer', 'user')

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
# class HighlightGroupSerializer(serializers.ModelSerializer):
#     # a custom field containing all the questions and answers
#     questions = serializers.ListField(child=GenericSubmittedAnswerField())
#     offsets = JSONSerializerField()

#     class Meta:
#         model = HighlightGroup
#         fields = ('tua', 'offsets', 'questions')

#     def create(self, validated_data):
#         # Get the answers nested models
#         answers = validated_data.pop('questions')

#         # Remove the force_insert if it's there
#         validated_data.pop('force_insert', None)

#         # create the highlight group first
#         highlight_group = HighlightGroup.objects.create(**validated_data)

#         # Add the highlight group model to the kwargs and save
#         for answer in answers:
#             model = answer['class']
#             kwargs = answer['data']
#             # Add the highlight group instance to the kwargs
#             kwargs['highlight_group'] = highlight_group
            
#             # There is a special case if it's a checklist,
#             # Because of the many to many relationship, this needs to be saved differently
#             if model == CLSubmittedAnswer:
#                 # Get the answers:
#                 answers = kwargs.pop('answer')
#                 # first create the CLSubmitted answer
#                 submission = CLSubmittedAnswer.objects.create(**kwargs)
#                 # Now add the answers
#                 submission.answer.add(*answers)

#             # For all other models, simply create the objects
#             else:
#                 model.objects.create(**kwargs)

#         return highlight_group 

class OffsetField(serializers.Field):
    def __init__(offsets):
        self.offsets = offsets

    # Override
    def to_representation(self, obj):
        ret = {"selector": {"@type": "MultiplePositionTextSelector"}}
        ret["selector"]["offsets"] = [{"start": start, "end": end} for (start, end) in self.offsets]

        return ret

    # Override
    def to_internal_value(self, data):
        ret = json.loads(data) # Convert to Python dict
        return json.dumps(ret["offsets"]) # Convert back to native form of offsets, a JSON object

class HighlightGroupSerializer(serializers.Serializer):
    # W3 Annotation Data Model properties
    def __init__(self, offsets):
        target = OffsetField(offsets)

    # Keep HighlightGroup metadata
    questions = serializers.ListField(child=GenericSubmittedAnswerField()) # A custom field containing all the questions and answers
    offsets = JSONSerializerField()

    class Meta:
        model = HighlightGroup
        fields = ('offsets', 'questions')

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
            
            # There is a special case if it's a checklist,
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