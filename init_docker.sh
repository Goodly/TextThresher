#!/bin/bash
# MSYS_NO_PATHCONV fixes paths on Docker Toolbox on Windows using Git Bash / Mingw
# Harmless everywhere else.
export MSYS_NO_PATHCONV=1
# Maintain original behavior of loading annotations.
# If you don't want to load annotations, just run these two init scripts
# separately, without parameters.
./init_thresher.sh --with-annotations
./init_pybossa.sh
