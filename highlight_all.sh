#!/bin/bash
# MSYS_NO_PATHCONV fixes paths on Docker Toolbox on Windows using Git Bash / Mingw
# Harmless everywhere else.
export MSYS_NO_PATHCONV=1
# DB updates can use either 'run' or 'exec'
docker-compose exec thresher_api sh /home/thresher/docker/thresher_api/highlight_all.sh
