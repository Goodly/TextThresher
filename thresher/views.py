import logging
logger = logging.getLogger(__name__)

from django.contrib.auth.models import User
from django.db.models import Prefetch
from django.db.models import prefetch_related_objects

from rest_framework import routers, viewsets
from rest_framework.decorators import list_route, api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import GenericAPIView

from models import Article, Topic, HighlightGroup, Project, Question, Answer, ArticleHighlight, UserProfile
from serializers import (UserProfileSerializer, ArticleSerializer,
                         TopicSerializer, HighlightGroupSerializer,
                         ProjectSerializer, QuestionSerializer,
                         NLPQuestionSerializer,
                         ArticleHighlightSerializer, RootTopicSerializer,
                         SubmittedAnswerSerializer)

# Views for serving the API

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class UserProfileViewSet(viewsets.ReadOnlyModelViewSet):
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
        # TODO: assuming that user wants the first "next question"
        next_question_array_text = answer.next_questions
        if len(next_question_array_text) > 0:
            next_question_first_text = next_question_array_text.split(",")[0]
            next_question_first_text = next_question_first_text[2:]
            next_question = int(next_question_first_text)
        else:
            return Response("{'next_question': 'null'}", 
                            status=status.HTTP_404_NOT_FOUND)
        serializer = QuestionSerializer(next_question, many=False)
        return Response(serializer.data)


def collectHighlightTasks(articles=None, topics=None, project=None):

    project_data = ProjectSerializer(project, many=False).data
    topics_data = RootTopicSerializer(topics, many=True).data
    return [{ "project": project_data,
              "topics": topics_data,
              "article":
                  ArticleSerializer(article, many=False).data
           } for article in articles ]


class HighlightTasks(GenericAPIView):
    # GenericAPIView assists by providing the pagination settings
    # and helpful pagination API

    """
    /highlighter_tasks2

    Provides highlight tasks as an array of objects, where each object has
    all the information to set up the highlight_tool for a task:

    1. the project description
    2. the topics to use
    3. the article to highlight

    This endpoint is paginated for use without Pybossa in the loop.
    """
    queryset = Article.objects.all()

    def get(self, request, *args, **kwargs):

        # GenericAPIView passes kwargs to Serializer in get_serializer
        # But "?format=json&page=2" works without it.
        # kwargs = {'context': self.get_serializer_context()}

        # Pagination code is derived from rest_framework.mixins.ListModelMixin
        # and rest_framework.generics.GenericAPIView:get_serializer
        project = Project.objects.get(name__exact="Deciding Force Highlighter")
        topics = Topic.objects.filter(parent=None)

        articles = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(articles)
        if page is not None:
            tasks = collectHighlightTasks(page, topics, project)
            return self.get_paginated_response(tasks)

        tasks = collectHighlightTasks(articles, topics, project)
        return Response(tasks)


class HighlightTasksNoPage(HighlightTasks):
    """
    /highlighter_tasks

    Provides highlight tasks as an array of objects, where each object has
    all the information to set up the highlight_tool for a task:

    1. the project description
    2. the topics to use
    3. the article to highlight

    This endpoint is **not paginated**, as it will be used for bulk export
    to Pybossa.
    """

    pagination_class = None

# This shows how to do additional filtering if needed...
#    def get_queryset(self):
#        articles = super(HighlightTasksNoPage, self).get_queryset()
#        return articles.filter(
#            id__in=[9, 11, 38, 53, 55, 202, 209, 236, 259]
#        ).order_by('id')

def collectQuizTasks(articles=None, topics=None, project=None):
    taskList = []
    for topic in topics:
        taskList.extend(collectQuizTasksForTopic(articles, topic, project))
    return taskList

def collectQuizTasksForTopic(articles=None, topic=None, project=None):
    taskList = []

    # getTopicTree returns the topic with all levels of its subtopic tree
    topictree = topic.getTopicTree()
    prefetch_related_objects(topictree, "questions__answers")

    # Set up Prefetch that will cache just the highlights matching
    # this topic to article.users_highlights[n].highlightsForTopic
    # Prefetching uses one query per related table to populate caches.
    # This helps us avoid per row queries when looping over rows.
    topicHighlights = (HighlightGroup.objects.filter(topic=topic)
                       .order_by("case_number")
                       .prefetch_related("submitted_answers"))
    fetchHighlights = Prefetch("users_highlights__highlights",
                               queryset=topicHighlights,
                               to_attr="highlightsForTopic")
    # Find articles highlighted with the topic within the provided queryset
    articles = (articles
                .filter(users_highlights__highlights__topic=topic)
                .prefetch_related(fetchHighlights))

    articles = articles.order_by("id")

    project_data = ProjectSerializer(project, many=False).data
    topictree_data = TopicSerializer(topictree, many=True).data

    # With the prefetching config above, the loops below will
    # be hitting caches. Only 8 queries should be issued against 8 tables,
    # i.e. The query count will not be a function of number of rows returned.
    for article in articles:
        # Our prefetched highlightsForTopic is nested under
        # the ArticleHightlight record, in HighlightGroup
        # Not expecting more than one ArticleHighlight record
        # but safest to code as if there could be more than one.

        # TODO: Need to further split task by case_number here.
        highlights = [ hg
                       for ah in article.users_highlights.all()
                       for hg in ah.highlightsForTopic
        ]

        taskList.append({
           "project": project_data,
           "topTopicId": topic.id,
           "topictree": topictree_data,
           "article": ArticleSerializer(article, many=False).data,
           "highlights": HighlightGroupSerializer(
                             highlights, many=True).data,
        })

    return taskList

@api_view(['GET'])
def quiz_tasks(request):
    """
    /quiz_tasks

    Provides tasks as an array of objects, where each object has
    all the information to set up the quiz for a task:

    1. the project description
    2. the Topic
    3. the article
    4. the highlights for the Topic, per article
    5. the questions and answers for this Topic
    """
    if request.method == 'GET':
        taskList = collectQuizTasks(
            articles = Article.objects.all(),
            topics = Topic.objects.filter(parent=None),
            project = Project.objects.get(name__exact="Deciding Force Quiz")
        )
        logger.info("Collected %d quiz tasks." % len(taskList))
        # TODO: this needs to be changed to a paginated endpoint for MockQuiz to use
        # Export first 10 for now
        taskList = taskList[:10]
        return Response(taskList)

def collectNLPTasks(articles=None, topics=None):
    questions = []
    for root in topics:
        topictree = root.getTopicTree()
        prefetch_related_objects(topictree, "questions")
        for topic in topictree:
            nlp_input_format = NLPQuestionSerializer(topic.questions.all(),
                                                     many=True)
            questions.extend(nlp_input_format.data)

    taskList = [{
                  "article_id": article.id,
                  "Topic Text": article.text,
                  "Questions": questions
                }
        for article in articles
    ]
    return taskList

@api_view(['GET'])
def NLP_tasks(request):
    if request.method == 'GET':
        taskList = collectNLPTasks(
            articles = Article.objects.all(),
            topics = Topic.objects.filter(parent=None),
        )
        logger.info("Collected %d quiz tasks." % len(taskList))
        # This endpoint is just for debugging use, so limit response size
        taskList = taskList[:10]
        return Response(taskList)

# Register our viewsets with the router
ROUTER = routers.DefaultRouter()
ROUTER.register(r'projects', ProjectViewSet)
ROUTER.register(r'users', UserProfileViewSet)
ROUTER.register(r'articles', ArticleViewSet)
ROUTER.register(r'topics', TopicViewSet)
ROUTER.register(r'highlight_groups', HighlightGroupViewSet)
ROUTER.register(r'article_highlights', ArticleHighlightViewSet)
