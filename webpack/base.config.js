'use strict';

import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import OnBuildPlugin from 'on-build-webpack';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import child_process from 'child_process';

const PROTOCOL = 'http';
const WEBPACK_LISTEN_IP = process.env.WEBPACK_LISTEN_IP || 'localhost';
const WEBPACK_HOSTNAME = process.env.WEBPACK_HOSTNAME || 'localhost';
const WEBPACK_PORT = parseInt(process.env.WEBPACK_PORT, 10) || 3001;
const PUBLIC_PATH = `${PROTOCOL}://${WEBPACK_HOSTNAME}:${WEBPACK_PORT}/`;

// Default to building outside container using host mounted dir and tools
var buildPath = path.resolve(__dirname, '..');
// This is only set inside the container
if (process.env.WEBPACK_BUILD_DIR) {
  buildPath = path.resolve(process.env.WEBPACK_BUILD_DIR);
};

const PATHS = {
  buildPath: buildPath,
  app: path.resolve(buildPath, './app'),
  dist: path.resolve(buildPath, './dist'),
  staticRoot: path.resolve(buildPath, './app/staticroot'),
  vendorPath: path.resolve(buildPath, './vendor'),
  bowerPath: path.resolve(buildPath, './vendor/bower_components')
};

function resolveBowerPath(componentPath) {
  return path.resolve(PATHS.bowerPath, componentPath);
};

function execCmd(command) {
  console.log('\n');
  console.log(command);
  // If err, throw and halt immediately.
  child_process.execSync(command, { cwd: PATHS.dist, timeout: 5000 });
};

export default {
  devServer: {
    contentBase: [PATHS.staticRoot, PATHS.vendorPath],
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
  context: PATHS.buildPath,
  devtool: '#source-map',
  entry: {
    app: [
      'babel-polyfill',
      './app/index'
    ],
    highlight: [
      'babel-polyfill',
      './app/highlight'
    ],
    quiz: [
      'babel-polyfill',
      './app/quiz'
    ],
  },
  resolve: {
    alias: {
      modernizr: resolveBowerPath('modernizr/modernizr.js'),
    },
    root: [PATHS.app, PATHS.bowerPath],
    modulesDirectories: ['node_modules', 'web_modules'],
    extensions: ['', '.js', '.jsx']
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
        include: PATHS.app,
        loaders: [] // ['eslint-loader']
      }
    ],
    loaders: [
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.css$/,
        loaders: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.scss$/,
        loader: 'style!css?sourceMap!autoprefixer?browsers=last 2 version!sass?outputStyle=expanded&sourceMap'
      },
      {
        test: /\.jpg$/,
        loader: 'file-loader'
      },
      {
        test: /\.(jpe?g|png|gif|woff(2)?|eot|otf)$/,
        loader: "url?limit=10000&name=[sha512:hash:base64:7].[ext]"
      },
      {
        test: /\.(svg|ttf)$/,
        include: path.resolve(buildPath, './app/styles/fonts'),
        loader: 'file-loader'
      },
      {
        test: /\.js$/,
        include: [/app/, /test/],
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
        },
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist/*'], {
      root: PATHS.buildPath,
      verbose: true,
      dry: false,
      exclude: []
    }),
    new HtmlWebpackPlugin({
      title: 'TextThresher',
      template: './app/templates/index_template.html',
      chunks: ['app'],
      chunksSortMode: 'dependency',
      filename: 'index.html',
    }),
    new OnBuildPlugin(function () {
      // copy files from the 'app/staticroot/' dir
      execCmd(`cp -arv ${PATHS.app}/staticroot/* ${PATHS.dist}`); // */
      console.log('\n');
    }),
    new webpack.NoErrorsPlugin(),
//  new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin()
  ],
  noParse: [/node_modules/, new RegExp(PATHS.bowerPath)],
  externals: {
    'cheerio': 'window',
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': true
  }
};
