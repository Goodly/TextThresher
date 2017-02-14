#!/bin/bash
set -e
cd /home/thresher
export PYTHONPATH=/home/thresher
python manage.py collectstatic --noinput
sh /home/thresher/docker/thresher_api/reset_db.sh
python docker/thresher_api/init_default_users.py
python data/load_data.py --old-schema-dir=data/DF-schema
#python data/load_data.py --schema-dir=data/sample/schema
python data/load_data.py --article-dir=data/sample/article
