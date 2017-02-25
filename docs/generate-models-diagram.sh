#!/bin/sh
export DJANGO_SETTINGS_MODULE=thresher_backend.graphviz_settings
python manage.py graph_models --pygraphviz -o docs/thresher_models.png thresher
python manage.py graph_models --pygraphviz -o docs/thresher_models.svg thresher
