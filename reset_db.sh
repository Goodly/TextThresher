#!/bin/bash
(python manage.py sqlflush | python manage.py dbshell) && python manage.py migrate
