#!/bin/bash
set -e
cd /home/thresher
export PYTHONPATH=/home/thresher
#python data/load_data.py --schema-dir=data/sample/schema
python data/load_data.py --old-schema-dir=data/DF-schema
# --with-annotations imports any ArticleHighlight, HighlightGroup markup,
# and any topics that don't already exist.
python data/load_data.py --article-dir=data/sample/article --with-annotations
#python data/load_data.py --article-dir=data/sample/article
