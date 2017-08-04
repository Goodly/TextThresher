#!/bin/bash
set -e
cd /home/thresher
export PYTHONPATH=/home/thresher
python manage.py migrate
exec gunicorn -b :5000 -w 10 --error-logfile - --access-logfile - --reload thresher_backend.wsgi
