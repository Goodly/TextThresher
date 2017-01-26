#!/bin/bash
set -e
cd /home/pybossa/repo
. /home/pybossa/env/bin/activate
python cli.py db_create
