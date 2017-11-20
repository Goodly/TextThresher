import logging
logger = logging.getLogger(__name__)

from itertools import groupby

from django.db.models import Prefetch
from django.db.models import prefetch_related_objects
from data.nlp_hint_types import QUESTION_TYPES

from thresher.models import NLPHints, HighlightGroup

from thresher.serializers import (ProjectSerializer,
                                  ArticleSerializer,
                                  TopicSerializer,
                                  TopicSerializer2,
                                  HighlightGroupSerializer,
                                  NLPQuestionSerializer,
                                  NLPHintSerializer)


def collectNLPTasks(articles=None):
    taskList = [{
                  "article_id": article.id,
                  "Topic Text": article.text,
                  "Questions": QUESTION_TYPES
                }
        for article in articles
    ]
    return taskList


def collectHighlightTasks(articles=None, topics=None, project=None):

    articles = articles.order_by("article_number").distinct()
    logger.info("collectHighlightTasks sorting by article_number: {}".format(
                [article.article_number for article in articles]))
    project_data = ProjectSerializer(project, many=False).data
    topics_data = TopicSerializer(topics, many=True).data
    return [{ "project": project_data,
              "topics": topics_data,
              "article":
                  ArticleSerializer(article, many=False).data
           } for article in articles ]


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
    exclude_ids = []

    # Pick the contributor based on what's selected in the GUI.
    contributor_id = project.task_config['contributor_id']
    topicHighlights = HighlightGroup.objects.filter(topic=topic,
        article_highlight__contributor=contributor_id)

    # Filter the highlights based on the min tokens provided on project creation
    min_tokens_per_highlight = project.task_config['min_tokens']
    max_tokens_per_highlight = project.task_config['max_tokens']
    for topic_hlght in topicHighlights:
        total_count = topic_hlght.token_count()
        if (total_count < min_tokens_per_highlight
            or total_count > max_tokens_per_highlight):
            exclude_ids.append(topic_hlght.id)
            logger.info("Excluded HighlightGroup: {} {} {} tokens".
                        format(topic_hlght.id, topic_hlght.topic.name, total_count))

    topicHighlights = topicHighlights.exclude(id__in=exclude_ids)

    fetchHighlights = Prefetch("highlight_taskruns__highlights",
                               queryset=topicHighlights,
                               to_attr="highlightsForTopic")
    # Find articles highlighted with the topic within the provided queryset
    # distinct is essential after prefetch_related chained method
    articles = (articles
                .filter(highlight_taskruns__highlights__topic=topic)
                .prefetch_related(fetchHighlights)
                .prefetch_related(fetchHints)
                .order_by("article_number")
                .distinct())
    logger.info("collectQuizTasks sorting by article_number for topic {}: {}"
                .format(topic.name, [article.article_number for article in articles])
               )

    project_data = ProjectSerializer(project, many=False).data
    topictree_data = TopicSerializer2(topictree, many=True).data

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
        # See data.pybossa_api.save_quiz_taskrun for import code
        sortkey = lambda x: x.case_number
        hg_by_case = sorted(highlights, key=sortkey)

        # Although this code can send multiple HighlightGroups, the
        # Quiz task presenter will only use the first one.
        # So when there are multiple highlight taskruns in the database,
        # (for a given article and topic),
        # the taskrun to be processed by a Quiz will essentially be selected
        # at random. There will need to be a way to flag the
        # official "Gold Standard" HighlightGroup that was distilled from
        # multiple Highlighter taskruns, that will be the one sent to the Quiz.
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
