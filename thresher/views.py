import logging
logger = logging.getLogger(__name__)

from rest_framework.response import Response
from rest_framework.generics import GenericAPIView

from models import (Project,
                    Article,
                    Topic)

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
