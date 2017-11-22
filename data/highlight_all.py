import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "thresher_backend.settings")

import logging
logger = logging.getLogger(__name__)

import django
django.setup()

from thresher.models import Article, Topic
from thresher.models import Contributor, ArticleHighlight, HighlightGroup

GOLDUSERNAME=u"Full Text Highlighted"

def highlightArticles(root_topics, article_set, contributor):
    topicList = root_topics.all().values_list("name", flat=True)
    topicNames = ", ".join(topicList)
    logger.info(u"Annotating entire articles with following topics: {}"
                .format(topicNames))

    for article_obj in article_set:
        taskruns = article_obj.highlight_taskruns
        if taskruns.filter(contributor__username=GOLDUSERNAME).count() == 0:
            logger.info("Adding highlights to article number: {}"
                        .format(article_obj.article_number))
            article_highlight = ArticleHighlight.objects.create(
                article=article_obj,
                contributor=contributor
            )
            offset_list = [[0, len(article_obj.text), article_obj.text]]
            case_number = 0
            for topic_obj in root_topics.all():
                highlight = HighlightGroup.objects.create(offsets=offset_list,
                                                          case_number=case_number,
                                                          topic=topic_obj,
                                                          article_highlight=article_highlight)
if __name__ == '__main__':
    root_topics = Topic.objects.filter(topic_number=0)
    article_set = Article.objects.all()
    (contributor, created) = Contributor.objects.get_or_create(
        username=GOLDUSERNAME
    )
    highlightArticles(root_topics, article_set, contributor)
