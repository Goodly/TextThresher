import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "thresher_backend.settings")

import django
django.setup()

import json

from thresher.models import NLPHints
from data.nlp_hint_types import QUESTION_TO_HINT_TYPE

def nlp_load(annotations):
    resultList = json.loads(annotations)
    for result in resultList:
        article_id=result['article_id']
        for hint in result['Hints']:
            question_id = hint['qID']
            hint_type = QUESTION_TO_HINT_TYPE[question_id]
            highlightList = hint['Highlights']
            offsetList = hint['Indices']
            # Store the text after its offset pair to make a triplet, e.g.:
            # [16,22,"Denver"]
            # You could argue that an object would be better style. Oh well.
            for i in range(len(offsetList)):
                offsetList[i].append(highlightList[i])
            NLPHints.objects.create(
                article_id = article_id,
                hint_type = hint_type,
                offsets = offsetList
            )
    return True
