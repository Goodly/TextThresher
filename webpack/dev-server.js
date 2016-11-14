'use strict';

/**
  * You can use environment variables to set what to listen on and the
  * externally reachable host ip or hostname.
  *
  * Examples:
  * WEBPACK_PORT=3003 npm run dev
  * WEBPACK_HOSTNAME=192.18.1.100 WEBPACK_LISTEN_IP=0.0.0.0 npm run dev
  * WEBPACK_HOSTNAME=54.69.118.85 WEBPACK_LISTEN_IP=172.31.45.111 npm run dev
  * WEBPACK_HOSTNAME=thresher.example.com WEBPACK_LISTEN_IP=0.0.0.0 npm run dev
**/

require('babel-register');

var colors = require('colors');
var debug = require('debug')('dev');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

var config = require('./dev.config');

var compiler = webpack(config);
var devServer = new WebpackDevServer(compiler, config.devServer);

devServer.listen(config.devServer.port, config.devServer.host, function () {
  console.log('server available at:'.underline.red);
  console.log(`${config.devServer.publicPath}#/article/0`.underline.yellow);
  console.log(`${config.devServer.publicPath}#/quiz/0`.underline.green);
});

