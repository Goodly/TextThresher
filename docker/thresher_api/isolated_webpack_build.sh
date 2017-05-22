#!/bin/bash
cd /home/webpack_build

# Create the directories that receive build output
mkdir dist
mkdir pbs-highlighter
mkdir pbs-quiz

ln -s /home/thresher/.babelrc .
ln -s /home/thresher/.bowerrc .
ln -s /home/thresher/.eslintrc .
ln -s /home/thresher/app .
ln -s /home/thresher/bower.json .
ln -s /home/thresher/package.json .
ln -s /home/thresher/webpack .
ln -s /home/thresher/webpack.config.js .
npm install
bower install
