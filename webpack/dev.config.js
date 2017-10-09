require('babel-register');

console.log('Building with dev.config.js\n');
var webpack = require('webpack');

const config = require('../webpack.config.js');

const PUBLIC_HOST = config.devServer.public;

config.entry.articleView.unshift(
  `webpack-dev-server/client?http://${PUBLIC_HOST}`,
  'webpack/hot/only-dev-server'
);

config.plugins.push(
  new webpack.HotModuleReplacementPlugin()
);

module.exports = config;
