import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "thresher_backend.settings")

import logging
logger = logging.getLogger(__name__)

import django
django.setup()

from thresher.models import Article, Topic
from thresher.models import Contributor, ArticleHighlight, HighlightGroup

GOLDUSERNAME=u"Full Text Highlighted"

if __name__ == '__main__':
    (contributor, created) = Contributor.objects.get_or_create(
        username=GOLDUSERNAME
    )
    root_topics = Topic.objects.filter(topic_number=0)

    for article_obj in Article.objects.all():
        taskruns = article_obj.highlight_taskruns
        if taskruns.filter(contributor__username=GOLDUSERNAME).count() == 0:
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
