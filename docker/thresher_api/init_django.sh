#!/bin/bash
set -e
cd /home/thresher
export PYTHONPATH=/home/thresher
python manage.py collectstatic --noinput
python manage.py flush --noinput
python manage.py migrate
