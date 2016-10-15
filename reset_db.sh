#!/bin/bash
DJANGO_SETTINGS_MODULE=thresher_backend.settings
(python manage.py sqlflush | python manage.py dbshell) && python manage.py migrate
