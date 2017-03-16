import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "thresher_backend.settings")

import django
django.setup()

import json

from data import init_defaults
from thresher.models import ArticleHighlight, HighlightGroup

def nlp_load(annotations):
    print annotations
    researchers = init_defaults.createThresherGroup()
    created_by = init_defaults.createNick(groups=[researchers])
    resultList = json.loads(annotations)
    for result in resultList:
        ah = ArticleHighlight.objects.create(
            article_id=result['article_id'],
            created_by = created_by,
            highlight_source = 'NLP'
        )
        for hint in result['Hints']:
            question_id = hint['qID']
            highlightList = hint['Highlights']
            offsetList = hint['Indices']
            # Store the text after its offset pair to make a triplet, e.g.:
            # [16,22,"Denver"]
            # You could argue that an object would be better style. Oh well.
            for i in range(len(offsetList)):
                offsetList[i].append(highlightList[i])
            # HighlightGroup is overloaded to store highlights from three
            # sources 1) Topic highlighter, 2) NLP hints, 3) Extra answer context
            # TODO: Think about whether it's good or bad to overload this heavily.
            # Note: storing question_id in case_number is a temporary hack
            HighlightGroup.objects.create(
                article_highlight = ah,
                topic = None,
                case_number = question_id, # TODO: temporary hacky hack
                highlight_text = json.dumps(highlightList),
                offsets = json.dumps(offsetList)
            )
    return True
