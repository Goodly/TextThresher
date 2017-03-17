import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "thresher_backend.settings")

import django
django.setup()

import json

from thresher.models import NLPHints

def nlp_load(annotations):
    resultList = json.loads(annotations)
    for result in resultList:
        article_id=result['article_id']
        for hint in result['Hints']:
            question_id = hint['qID']
            highlightList = hint['Highlights']
            offsetList = hint['Indices']
            # Store the text after its offset pair to make a triplet, e.g.:
            # [16,22,"Denver"]
            # You could argue that an object would be better style. Oh well.
            for i in range(len(offsetList)):
                offsetList[i].append(highlightList[i])
            NLPHints.objects.create(
                article_id = article_id,
                question_id = question_id,
                highlight_text = json.dumps(highlightList),
                offsets = json.dumps(offsetList)
            )
    return True
