#!/bin/bash
# Must use 'exec' since ./manage.py collectstatic modifies the container
docker-compose exec thresher_api sh /home/thresher/docker/thresher_api/init_django.sh
# DB updates can use either 'run' or 'exec'
docker-compose exec thresher_api sh /home/thresher/docker/thresher_api/init_users.sh
