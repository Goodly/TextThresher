#!/bin/bash
set -e
cd /home/thresher
export PYTHONPATH=/home/thresher
python data/load_data.py --schema-dir=data/sample/schema
# --with-annotations imports any ArticleHighlight, HighlightGroup markup,
# and any topics that don't already exist.
if [ -n "$1" ]; then
  python data/load_data.py --article-dir=data/sample/article "$1"
else
  python data/load_data.py --article-dir=data/sample/article
fi
