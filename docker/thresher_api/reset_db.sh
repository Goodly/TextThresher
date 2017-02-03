#!/bin/bash
python manage.py sqlflush | python manage.py dbshell
# Next line is temporary workaround until django-cors-headers PR#121 is released
# See https://github.com/ottoyiu/django-cors-headers/issues/121
python manage.py makemigrations corsheaders
python manage.py migrate
