'use strict';

/* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
/* eslint camelcase: 0 */

require('babel/register');
var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var bowerPath = path.join(__dirname, '../vendor/bower_components');

// TODO: pipe in stats
// var writeStats = require('./utils/write-stats');

// clean `dist` dir and copy in the `assets` dir
require('./utils/clean-dist')();
require('./utils/copy-to-dist')();

module.exports = {
  devtool: 'source-map',
  entry: {
    app: './app/index.js'
  },
  output: {
    path: path.join(__dirname, '../dist'),
    filename: '[name]-[chunkhash].js',
    chunkFilename: '[name]-[chunkhash].js',
    publicPath: ''
  },
  module: {
    preLoaders: [
      {
        test: /\.js$|.jsx$/,
        include: path.join(__dirname, '../app'),
        exclude: /node_modules/,
        loaders: ['eslint', 'jscs']
      }
    ],
    loaders: [
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.(woff|eot|ttf)$/,
        loader: 'url?limit=10000&name=[sha512:hash:base64:7].[ext]'
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        loader: 'url?limit=10000&name=[sha512:hash:base64:7].[ext]!image?optimizationLevel=7&progressive&interlaced'
      },
      {
        test: /\.(svg)$/,
        include: path.join(__dirname, '../app/styles/fonts'),
        loader: "file-loader"
      },
      {
        test: /\.js$|.jsx$/,
        exclude: /node_modules/,
        loader: 'babel'
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract('style', 'css!autoprefixer?browsers=last 2 version!sass')
      }
    ]
  },
  plugins: [

    new HtmlWebpackPlugin(),
    // extract css
    new ExtractTextPlugin('[name]-[chunkhash].css'),

    // set env
    new webpack.DefinePlugin({
      'process.env': {
        BROWSER: JSON.stringify(true),
        NODE_ENV: JSON.stringify('production')
      }
    }),

    // optimizations
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        screw_ie8: true,
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
    }),

    // write webpack stats
    // function () { this.plugin('done', writeStats); }

  ],
  resolve: {
    extensions: ['', '.js', '.json', '.jsx'],
    modulesDirectories: ['node_modules', 'app', bowerPath]
  }
};
