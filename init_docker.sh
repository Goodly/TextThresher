#!/bin/bash
# Maintain original behavior of loading annotations.
# If you don't want to load annotations, just run these two init scripts
# separately, without parameters.
./init_thresher.sh --with-annotations
./init_pybossa.sh
