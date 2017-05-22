#!/bin/bash
cd $WEBPACK_ISOLATED_DIR

# Create the directory that receives build output
mkdir dist

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
