#!/bin/bash
# MSYS_NO_PATHCONV fixes paths on Docker Toolbox on Windows using Git Bash / Mingw
# Harmless everywhere else.
export MSYS_NO_PATHCONV=1
# Must use 'exec' since ./manage.py collectstatic modifies the container
docker-compose exec thresher_api sh /home/thresher/docker/thresher_api/init_all.sh "$1"
