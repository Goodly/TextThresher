import logging
logger = logging.getLogger(__name__)

from django.db.models import Q

from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.generics import GenericAPIView

from models import (Project,
                    Article,
                    Topic,
                    HighlightGroup,
                    NLPHints)

from data.task_collector import (collectNLPTasks,
                                 collectHighlightTasks,
                                 collectQuizTasks)

class HighlightTasks(GenericAPIView):
    # GenericAPIView assists by providing the pagination settings
    # and helpful pagination API

    """
    /highlighter_tasks

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
        project = Project.objects.get(name__exact="Highlighter")
        topics = Topic.objects.filter(parent=None)

        articles = self.filter_queryset(self.get_queryset()).order_by("id")
        page = self.paginate_queryset(articles)
        if page is not None:
            tasks = collectHighlightTasks(page, topics, project)
            return self.get_paginated_response(tasks)

        tasks = collectHighlightTasks(articles, topics, project)
        return Response(tasks)

# This shows how to do additional filtering if needed...
#    def get_queryset(self):
#        articles = super(HighlightTasks, self).get_queryset()
#        return articles.filter(
#            id__in=[9, 11, 38, 53, 55, 202, 209, 236, 259]
#        ).order_by('id')


# This shows how to subclass the above endpoint and make it unpaginated, in case you
# want to download a large batch of tasks. Would be a bad idea on a public facing API.
class HighlightTasksNoPage(HighlightTasks):
    """
    This endpoint is **not paginated**
    """

    pagination_class = None


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
        # This endpoint is just for testing the Quiz front-end, so limit results
        # for speed and quality.
        # There are lots of topics in the test set without questions.
        # Limit this to the 4 main schemas we have questions for.
        # Finding the cases for the four specified root topics in the
        # first 20 articles generates 46 tasks.
        # TODO: Could add paginated version of endpoint like HighlightTasks
        taskList = collectQuizTasks(
            articles = Article.objects.filter(id__lte=1),
            topics = Topic.objects.filter(parent=None),
            project = Project.objects.get(name__exact="Quiz")
        )
        logger.info("Collected %d quiz tasks." % len(taskList))
        return Response(taskList)

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
