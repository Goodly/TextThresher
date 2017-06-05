import logging
logger = logging.getLogger(__name__)

from itertools import groupby

from django.db.models import Prefetch
from django.db.models import prefetch_related_objects
from django.db.models import Q

from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.generics import GenericAPIView, ListAPIView

from models import (Project,
                    Article,
                    Topic,
                    HighlightGroup,
                    NLPHints)

from serializers import (ProjectSerializer,
                         ArticleSerializer,
                         RootTopicSerializer,
                         TopicSerializer,
                         HighlightGroupSerializer,
                         NLPQuestionSerializer,
                         NLPHintSerializer)

from data.nlp_hint_types import QUESTION_TYPES

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


def collectQuizTasks(articles=None, topics=None, project=None):
    taskList = []
    for topic in topics:
        taskList.extend(collectQuizTasksForTopic(articles, topic, project))
    return taskList

def collectQuizTasksForTopic(articles=None, topic=None, project=None):
    taskList = []

    # getTopicTree returns the topic with all levels of its subtopic tree
    topictree = topic.getTopicTree()

    # Prefetching uses one query per related table to populate caches.
    # This helps us avoid per row queries when looping over rows.
    prefetch_related_objects(topictree, "questions__answers")

    # Set up the prefetch to retrieve all available hints for each article
    allHints = NLPHints.objects.all()
    fetchHints = Prefetch("hints",
                          queryset=allHints,
                          to_attr="allHints")
    logger.info("Found %d hints" % (len(allHints),))

    # Set up Prefetch that will cache just the highlights matching
    # this topic to article.highlight_taskruns[n].highlightsForTopic
    topicHighlights = (HighlightGroup.objects.filter(topic=topic)
                       .prefetch_related("submitted_answers"))
    fetchHighlights = Prefetch("highlight_taskruns__highlights",
                               queryset=topicHighlights,
                               to_attr="highlightsForTopic")
    # Find articles highlighted with the topic within the provided queryset
    # distinct is essential after prefetch_related chained method
    articles = (articles
                .filter(highlight_taskruns__highlights__topic=topic)
                .prefetch_related(fetchHighlights)
                .prefetch_related(fetchHints)
                .order_by("id")
                .distinct())

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

        highlights = [ hg
                       for ah in article.highlight_taskruns.all()
                       for hg in ah.highlightsForTopic
        ]
        # At this point, we are processing one topic for one article
        # All the highlights for a given topic/case need to be in one task.
        # Need to sort here instead of the above prefetch because we want
        # to ignore the potential grouping effect if there was more than one
        # ArticleHighlight in above list comprehension
        # See data.pybossa_api.save_highlight_taskrun for import code
        sortkey = lambda x: x.case_number
        hg_by_case = sorted(highlights, key=sortkey)

        for case_number, hg_case_group in groupby(hg_by_case, key=sortkey):
            taskList.append({
               "project": project_data,
               "topTopicId": topic.id,
               "topictree": topictree_data,
               "article": ArticleSerializer(article, many=False).data,
               "highlights": HighlightGroupSerializer(
                                 hg_case_group, many=True).data,
               "hints": NLPHintSerializer(article.allHints, many=True).data,
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
        # This endpoint is just for testing the Quiz front-end, so limit results
        # for speed and quality.
        # There are lots of topics in the test set without questions.
        # Limit this to the 4 main schemas we have questions for.
        # Finding the cases for the four specified root topics in the
        # first 20 articles generates 46 tasks.
        # TODO: Could add paginated version of endpoint like HighlightTasks
        df_schemas = Q(name="Protester") | Q(name="City")
        df_schemas |=  Q(name="Camp") | Q(name="Police")
        taskList = collectQuizTasks(
            articles = Article.objects.filter(id__lte=1),
            topics = Topic.objects.filter(df_schemas),
            project = Project.objects.get(name__exact="Quiz")
        )
        logger.info("Collected %d quiz tasks." % len(taskList))
        return Response(taskList)

def collectNLPTasks(articles=None, topics=None):
    taskList = [{
                  "article_id": article.id,
                  "Topic Text": article.text,
                  "Questions": QUESTION_TYPES
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
