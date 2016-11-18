'use strict';

import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import OnBuildPlugin from 'on-build-webpack';
import child_process from 'child_process';

const PROTOCOL = 'http';
const WEBPACK_LISTEN_IP = process.env.WEBPACK_LISTEN_IP || 'localhost';
const WEBPACK_HOSTNAME = process.env.WEBPACK_HOSTNAME || 'localhost';
const WEBPACK_PORT = parseInt(process.env.WEBPACK_PORT, 10) || 3001;
const PUBLIC_PATH = `${PROTOCOL}://${WEBPACK_HOSTNAME}:${WEBPACK_PORT}/`;

if (process.env.WEBPACK === 'cleandist') {
  // clean 'dist/' dir and copy files from the 'app/staticroot/' dir
  require('./utils/clean-dist')();
  require('./utils/copy-to-dist')();
  // give webpack stats a blank line to work with
  console.log('\n');
};

const PATHS = {
  app: path.resolve(__dirname, '../app'),
  dist: path.resolve(__dirname, '../dist'),
  highlight: path.resolve(__dirname, '../pbs-highlighter')
};

const bowerPath = path.resolve(__dirname, '../vendor/bower_components');

function resolveBowerPath(componentPath) {
  return path.resolve(bowerPath, componentPath);
};

export default {
  devServer: {
    contentBase: './app/staticroot',
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
    highlight: [
      'babel-polyfill',
      './app/highlight'
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
    path: PATHS.dist,
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js',
    sourceMapFilename: "[name].bundle.js.map",
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
      template: './app/templates/index_template.html',
      chunks: ['app'],
      filename: 'index.html',
    }),
    new OnBuildPlugin(function () {
      if (process.env.WEBPACK === 'cleandist') {
        let command = `cp ${PATHS.dist}/highlight.bundle.js ${PATHS.highlight}/bundle.js`;
        console.log('\nCopying highlight.bundle.js');
        console.log(command);
        try {
          child_process.execSync(command, { cwd: PATHS.dist, timeout: 5000 });
        } catch (err) {
          console.log('\n******* BUILD FAILED. OUTPUT BUNDLE NOT FOUND.');
          console.log(err.message);
          console.log('*******');
        };
        console.log('\n');
      }
    }),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin()
  ],
  noParse: [new RegExp(bowerPath), /node_modules/]
};
