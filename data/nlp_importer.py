import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "thresher_backend.settings")

import django
django.setup()

def nlp_load(annotations):
    print annotations
    return True
