import json
from django.contrib.auth.models import User
from rest_framework import serializers
from models import TUA, Article, AnalysisType

# Serializers define the API representation of the models.

class UserSerializer(serializers.ModelSerializer):
    password = serializers.WritableField(write_only=True)

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

class JSONFieldModelSerializer(serializers.ModelSerializer):
    json_fields = [] # subclasses should assign these

    def __init__(self, *args, **kwargs):
        super(JSONFieldModelSerializer, self).__init__(*args, **kwargs)

        # add transformation methods for the relevant fields
        def to_json(obj, value):
            return json.loads(value)

        for field in self.json_fields:
            setattr(self, 'transform_' + field, to_json)

class ArticleSerializer(JSONFieldModelSerializer):
    json_fields = ['annotators']

    class Meta:
        model = Article
        fields = ('article_id', 'text', 'date_published', 'city_published',
                  'state_published', 'periodical', 'periodical_code',
                  'parse_version', 'annotators')

class AnalysisTypeSerializer(JSONFieldModelSerializer):
    json_fields = ['glossary', 'topics', 'question_dependencies']

    class Meta:
        model = AnalysisType
        fields = ('id', 'name', 'instructions', 'glossary', 'topics',
                  'question_dependencies')

class TUASerializer(JSONFieldModelSerializer):
    json_fields = ['offsets']
    analysis_type = AnalysisTypeSerializer()
    article = ArticleSerializer()

    class Meta:
        model = TUA
        fields = ('id', 'tua_id', 'analysis_type', 'article', 'offsets')
        #depth = 1
