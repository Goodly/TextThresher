#!/bin/bash
set -e
cd /home/thresher
export PYTHONPATH=/home/thresher
sh docker/thresher_api/init_django.sh
sh docker/thresher_api/init_users.sh
sh docker/thresher_api/load_data.sh
