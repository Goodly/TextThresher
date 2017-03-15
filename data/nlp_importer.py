import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "thresher_backend.settings")

import django
django.setup()

def nlp_load(annotations, job_id):
    print annotations
    return True
