from django.contrib.auth.models import User

from rest_framework import routers, viewsets
from rest_framework.decorators import list_route, api_view
from rest_framework.response import Response
from rest_framework import status

from models import Article, Topic, HighlightGroup, Project, Question, Answer, ArticleHighlight, UserProfile
from serializers import (UserProfileSerializer, ArticleSerializer, TopicSerializer, 
                         HighlightGroupSerializer, ProjectSerializer, QuestionSerializer,
                         ArticleHighlightSerializer, RootTopicSerializer, SubmittedAnswerSerializer)

# Views for serving the API

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all().order_by('id')
    serializer_class = ArticleSerializer

class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.filter(parent=None)
    serializer_class = RootTopicSerializer

class HighlightGroupViewSet(viewsets.ModelViewSet):
    queryset = HighlightGroup.objects.all()
    serializer_class = HighlightGroupSerializer

    def create(self, request, *args, **kwargs):
        if isinstance(request.DATA, list):
            serializer = HighlightGroupSerializer(data=request.DATA, many=True)
            if serializer.is_valid():
                self.object = serializer.save(force_insert=True)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        else:
            return super(HighlightGroupViewSet, self).create(request, *args, **kwargs)

class ArticleHighlightViewSet(viewsets.ModelViewSet):
    queryset = ArticleHighlight.objects.all()
    serializer_class = ArticleHighlightSerializer

@api_view(['GET'])
def topic(request, id):
    """
    /topics/id \n
    Gets all the information associated with a specific topic.
    """
    if request.method == 'GET':
        topics = Topic.objects.get(id=id)
        serializer = TopicSerializer(topics, many=False)
        return Response(serializer.data)

@api_view(['GET'])
def child_topics(request, id):
    """
    /topics/id/children \n
    Gets all the child topics of a topic.
    """
    if request.method == 'GET':
        topics = Topic.objects.get(parent=Topic.objects.get(id=id))
        serializer = TopicSerializer(topics, many=False)
        return Response(serializer.data)


@api_view(['GET'])
def questions(request):
    """
    /question
    Gets all the questions.
    """
    if request.method == 'GET':
        questions = Question.objects.all()
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)

@list_route
@api_view(['GET'])
def question(request, id):
    """
    /question/id
    Gets a specific question.
    """
    if request.method == 'GET':
        question = Question.objects.get(id=id)
        serializer = QuestionSerializer(question, many=False)
        return Response(serializer.data)

@api_view(['GET'])
def next_question(request, id, ans_num):
    """
    /question/id/ans_num
    Gets the next question based on the ans_num
    """
    if request.method == 'GET':
        question = Question.objects.get(id=id)
        answer = Answer.objects.get(question=question, answer_number=ans_num)
        next_question = answer.next_question
        serializer = QuestionSerializer(next_question, many=False)
        return Response(serializer.data)

# Register our viewsets with the router
ROUTER = routers.DefaultRouter()
ROUTER.register(r'projects', ProjectViewSet)
ROUTER.register(r'users', UserProfileViewSet)
ROUTER.register(r'articles', ArticleViewSet)
ROUTER.register(r'topics', TopicViewSet)
ROUTER.register(r'highlight_groups', HighlightGroupViewSet)
ROUTER.register(r'article_highlights', ArticleHighlightViewSet)
