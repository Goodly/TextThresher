import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "thresher_backend.settings")

import logging
logger = logging.getLogger(__name__)

import django
django.setup()

from thresher.models import Article, Topic
from thresher.models import Contributor, ArticleHighlight, HighlightGroup

GOLDUSERNAME=u"Full Text Highlighted"

# Create a set of highlights that covers the entire article for
# every root topic, so the Researcher can send these directly to the Quiz
def highlightArticles(root_topics, article_set, contributor):
    topic_list = root_topics.all().values_list("name", flat=True)
    topic_names = ", ".join(topic_list)
    logger.info(u"Annotating entire articles with following topics: {}"
                .format(topic_names))

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
    # PE schemas start with topic_number 1
    root_topics = Topic.objects.filter(topic_number=1)
    article_set = Article.objects.all()
    (contributor, created) = Contributor.objects.get_or_create(
        username=GOLDUSERNAME
    )
    highlightArticles(root_topics, article_set, contributor)
