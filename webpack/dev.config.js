require('babel-register');

console.log('Building with dev.config.js\n');
var webpack = require('webpack');

const config = require('./base.config');

const PUBLIC_PATH = config.output.publicPath;

config.entry.app.unshift(
  `webpack-dev-server/client?${PUBLIC_PATH}`,
  'webpack/hot/only-dev-server'
);

config.plugins.push(
  new webpack.HotModuleReplacementPlugin()
);

module.exports = config
