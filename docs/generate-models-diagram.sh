#!/bin/sh
# docker-compose exec --user root thresher_api ./docs/generate-models-diagram.sh
./docs/install-graphviz.sh
export DJANGO_SETTINGS_MODULE=thresher_backend.graphviz_settings
python manage.py graph_models --pygraphviz -o docs/thresher_models.png thresher
python manage.py graph_models --pygraphviz -o docs/thresher_models.svg thresher
echo "Generated Thresher Django model entity-relationship diagrams."
