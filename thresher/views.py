from django.contrib.auth.models import User
from django.core.paginator import Paginator

from rest_framework import routers, viewsets
from rest_framework.decorators import list_route, api_view
from rest_framework.response import Response
from rest_framework import status

from models import Article, Topic, HighlightGroup, Client, Question, Answer, ArticleHighlight
from serializers import (UserSerializer, ArticleSerializer, TopicSerializer, 
                         HighlightGroupSerializer, ClientSerializer, QuestionSerializer,
                         ArticleHighlightSerializer, RootTopicSerializer, SubmittedAnswerSerializer)

# Views for serving the API

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer    

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all().order_by('article_id')
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
def next_question(request, id, ans_id):
    """
    /question/id/ans_id
    Gets the next question based on the ans_id
    """
    if request.method == 'GET':
        question = Question.objects.get(id=id)
        answer = Answer.objects.get(question=question, answer_id=ans_id)
        next_question = answer.next_question
        serializer = QuestionSerializer(next_question, many=False)
        return Response(serializer.data)

# Deprecated
# # Example POST data: {"id":1,"question_id":17,"question_text":"foo?","answers":[{"answer_content":"bar","answer_id":1},{"answer_content":"baz","answer_id":2},{"answer_content":"xyzzy","answer_id":3}]}
# @api_view(['POST'])
# def post_question(request):
#     if request.method == 'POST':
#         print("data", request.data)
#         serializer = QuestionSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# TODO: submit answer endpoint

# Register our viewsets with the router
ROUTER = routers.DefaultRouter()
ROUTER.register(r'clients', ClientViewSet)
ROUTER.register(r'users', UserViewSet)
ROUTER.register(r'articles', ArticleViewSet)
ROUTER.register(r'topics', TopicViewSet)
ROUTER.register(r'highlight_groups', HighlightGroupViewSet)
ROUTER.register(r'article_highlights', ArticleHighlightViewSet)
