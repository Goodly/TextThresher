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

var compiler = webpack(config.webpack);
var devServer = new WebpackDevServer(compiler, config.server.options);

devServer.listen(config.server.port, config.server.listen_ip, function () {
  debug('webpack-dev-server listening on %s:%s',
    config.server.listen_ip,
    config.server.port);
});

console.log('server available at:'.underline.yellow);
console.log(`${config.server.options.publicPath}#/article/0`.underline.yellow);
