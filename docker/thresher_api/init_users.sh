#!/bin/bash
set -e
cd /home/thresher
export PYTHONPATH=/home/thresher
python docker/thresher_api/init_default_users.py
