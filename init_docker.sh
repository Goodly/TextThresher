#!/bin/bash
docker-compose run thresher_api python manage.py collectstatic --noinput
docker-compose run thresher_api sh reset_db.sh
docker-compose run thresher_api python load_data.py --schema-dir=data/sample/schema --article-dir=data/sample/article

