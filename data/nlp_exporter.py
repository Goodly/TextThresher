import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "thresher_backend.settings")
import django
django.setup()
from django.db import connection

import logging
logger = logging.getLogger(__name__)

import json

import django_rq
q = django_rq.get_queue('nlp_exporter')

from thresher.models import Article, Topic
from data.task_collector import collectNLPTasks

@django_rq.job('nlp_generator', timeout=1800, result_ttl=24*3600)
def generate_nlp_tasks_worker(profile_id=None,
                              article_ids=None,
                              depends_on=None):
    startCount = len(connection.queries)
    articles = Article.objects.filter(id__in=article_ids)
    tasks = collectNLPTasks(articles)
    for task in tasks:
        # annotator expects an array of tasks
        hint_source = json.dumps( [task] )
        # send annotations to NLP container for annotation
        job = q.enqueue('nlp_worker.annotate.nlp_hints', hint_source,
                        timeout=600, result_ttl=24*3600)
    return ({
      "task_type": "NLP",
      "generatedTasks": len(tasks),
      "numberOfQueries": len(connection.queries) - startCount
    })
