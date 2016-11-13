'use strict';

import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const PROTOCOL = 'http';
const WEBPACK_LISTEN_IP = process.env.WEBPACK_LISTEN_IP || 'localhost';
const WEBPACK_HOSTNAME = process.env.WEBPACK_HOSTNAME || 'localhost';
const WEBPACK_PORT = parseInt(process.env.WEBPACK_PORT, 10) || 3001;
const PUBLIC_PATH = `${PROTOCOL}://${WEBPACK_HOSTNAME}:${WEBPACK_PORT}/`;

const PATHS = {
  app: path.resolve(__dirname, '../app'),
  build: path.resolve(__dirname, '../dist')
};

const bowerPath = path.resolve(__dirname, '../vendor/bower_components');

function resolveBowerPath(componentPath) {
  return path.resolve(bowerPath, componentPath);
};

export default {
  devServer: {
    contentBase: 'app',
    publicPath: PUBLIC_PATH,
    host: WEBPACK_LISTEN_IP,
    port: WEBPACK_PORT,
    hot: true,
    stats: {
      assets: true,
      colors: true,
      version: false,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false
    }
  },
  context: path.join(__dirname, '../'),
  devtool: 'source-map',
  entry: {
    app: [
      'babel-polyfill',
      './app/index'
    ],
  },
  resolve: {
    alias: {
      modernizr: resolveBowerPath('modernizr/modernizr.js'),
      bootstrap_sass: resolveBowerPath('bootstrap-sass/assets/stylesheets/_bootstrap.scss'),
    },
    extensions: ['', '.js', '.scss', 'hbs', 'tmpl', 'svg', 'woff', 'eot', 'svg', 'png'],
    root: [PATHS.app, bowerPath],
    modulesDirectories: ['node_modules', 'web_modules']
  },
  output: {
    path: PATHS.build,
    file: '[name]-[hash].js',
    filename: '[name]-[hash].js',
    chunkFilename: '[name]-[hash].js',
    sourceMapFilename: "[name]-[hash].js.map",
    publicPath: PUBLIC_PATH
  },
  module: {
  preLoaders: [
      {
        test: /\.js$/,
        include: path.join(__dirname, '../app'),
        loaders: [] // ['eslint-loader']
      }
    ],
    loaders: [
      {
        test: /\.json$/,
        loader: 'json'
      },

      {
        test: /\.scss$/,
        loader: 'style!css?sourceMap!autoprefixer?browsers=last 2 version!sass?outputStyle=expanded&sourceMap'
      },
      {
        test: /\.jpg$/,
        loader: 'file'
      },
      {
        test: /\.(jpe?g|png|gif|woff(2)?|eot|otf)$/,
        loader: "url?limit=10000&name=[sha512:hash:base64:7].[ext]"
      },
      {
        test: /\.(svg|ttf)$/,
        include: path.join(__dirname, '../app/styles/fonts'),
        loader: "file-loader"
      },
      {
        test: /\.js$/,
        include: [/app/, /test/],
        loaders: ["babel-loader?cacheDirectory=true"],
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'TextThresher',
      template: './app/assets/index_template.html',
      chunks: ['app']
    }),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin()
  ],
  noParse: [new RegExp(bowerPath), /node_modules/]
};
