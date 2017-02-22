#!/bin/bash
set -e
cd /home/thresher
export PYTHONPATH=/home/thresher
#python data/load_data.py --schema-dir=data/sample/schema
python data/load_data.py --old-schema-dir=data/DF-schema
python data/load_data.py --article-dir=data/sample/article
