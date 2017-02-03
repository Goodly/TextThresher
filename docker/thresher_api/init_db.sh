#!/bin/bash
set -e
cd /home/thresher
export PYTHONPATH=/home/thresher
python manage.py collectstatic --noinput
sh /home/thresher/docker/thresher_api/reset_db.sh
python data/load_data.py --schema-dir=data/sample/schema --article-dir=data/sample/article
