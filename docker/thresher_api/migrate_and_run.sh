#!/bin/bash
set -e
cd /home/thresher
export PYTHONPATH=/home/thresher
# Migrate will fail if the database container isn't ready yet.
# docker-compose "depends:" needs to have a better service ready check.
# So need to run a polling loop here against DB to pause to make sure
# DB is up, with about a 20 second timeout.
# In the meantime, the rushed programmer's bad solution to race conditions:
sleep 6
python manage.py migrate
exec gunicorn -b :5000 -w 10 --error-logfile - --access-logfile - --reload thresher_backend.wsgi
