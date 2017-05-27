'use strict';

console.log('Building with prod.config.js');
/* eslint camelcase: 0 */

var webpack = require('webpack');

// TODO: pipe in stats
// var writeStats = require('./utils/write-stats');

const config = require('./base.config');

config.plugins.push(

  // set env
  new webpack.DefinePlugin({
    'process.env': {
      BROWSER: JSON.stringify(true),
      NODE_ENV: JSON.stringify('production')
    }
  }),

  new webpack.LoaderOptionsPlugin({
    minimize: true
  }),

  // optimizations
  new webpack.optimize.UglifyJsPlugin({
    sourceMap: true,
    compress: {
      warnings: false,
      screw_ie8: true, // eslint-disable-line camelcase
      sequences: true,
      dead_code: true,
      drop_debugger: true,
      comparisons: true,
      conditionals: true,
      evaluate: true,
      booleans: true,
      loops: true,
      unused: true,
      hoist_funs: true,
      if_return: true,
      join_vars: true,
      cascade: true,
      drop_console: true
    },
    output: {
      comments: false
    }
  })

  // write webpack stats
  // function () { this.plugin('done', writeStats); }

);

module.exports = config
