#!/bin/bash
# Ubuntu 14.04 or Debian Jessie
apt-get update
apt-get install -y --no-install-recommends \
    graphviz libgv-python libgraphviz-dev
pip install -r docs/graphviz-reqs.txt
