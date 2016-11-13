'use strict';

console.log('Building with dev.config.js');
var webpack = require('webpack');

const config = require('./base.config');

const PUBLIC_PATH = config.output.publicPath;

config.entry.app.unshift(
  `webpack-dev-server/client?${PUBLIC_PATH}`,
  'webpack/hot/only-dev-server'
);

const jsLoaderIndex = config.module.loaders
  .findIndex(loader => String(loader.test) === String(/\.js$/));

config.module.loaders[jsLoaderIndex].loaders.unshift('react-hot-loader');

config.plugins.push(
  new webpack.HotModuleReplacementPlugin(),
  new webpack.DefinePlugin({
    'process.env': {
      BROWSER: JSON.stringify(true),
      NODE_ENV: JSON.stringify('development')
    }
  })
);

module.exports = config
