#!/bin/bash
# Must use 'exec' since ./manage.py collectstatic modifies the container
docker-compose exec thresher_api sh /home/thresher/docker/thresher_api/init_all.sh
