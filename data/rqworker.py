import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "thresher_backend.settings")

# Do time consuming Django setup before forking individual worker processes.
import django
django.setup()
from django.conf import settings

from django_rq import get_worker

if __name__ == '__main__':
    worker = get_worker('task_exporter', 'task_importer', 'file_importer',
                        'nlp_generator', 'nlp_importer')
    worker.work()
