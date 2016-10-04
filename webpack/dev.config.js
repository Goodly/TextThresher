'use strict';

import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const PROTOCOL = 'http';
const WEBPACK_LISTEN_IP = process.env.WEBPACK_LISTEN_IP || 'localhost';
const WEBPACK_HOSTNAME = process.env.WEBPACK_HOSTNAME || 'localhost';
const WEBPACK_PORT = parseInt(process.env.WEBPACK_PORT, 10) || 3001;
const PUBLIC_PATH = `${PROTOCOL}://${WEBPACK_HOSTNAME}:${WEBPACK_PORT}/app/`;

const bowerPath = path.join(__dirname, '../vendor/bower_components');

const PATHS = {
  app: path.join(__dirname, '../app'),
  build: path.join(__dirname, '../dist')
};

let resolveBowerPath = function(componentPath) {
  return path.join(bowerPath, componentPath);
};

export default {
  server: {
    listen_ip: WEBPACK_LISTEN_IP,
    port: WEBPACK_PORT,
    options: {
      publicPath: PUBLIC_PATH,
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
    }
  },
  webpack: {
    context: path.join(__dirname, '../'),
    devtool: 'source-map',
    entry: {
      app: [
        `webpack-dev-server/client?${PROTOCOL}://${WEBPACK_HOSTNAME}:${WEBPACK_PORT}`,
        'webpack/hot/only-dev-server',
        './app/index'
      ]
    },
    resolve: {
      alias: {
        modernizr: resolveBowerPath('modernizr/modernizr.js'),
        bootstrap_sass: resolveBowerPath('bootstrap-sass/assets/stylesheets/_bootstrap.scss'),
        jquery: resolveBowerPath('jquery/dist/jquery.js')
      },
      extensions: ['', '.js', '.scss', 'hbs', 'tmpl', 'svg', 'woff', 'eot', 'svg', 'png'],
      modulesDirectories: ['node_modules', 'web_modules', bowerPath, PATHS.app]
    },
    publicPath: PUBLIC_PATH,
    output: {
      path: __dirname,
      filename: '[name]-[hash].js',
      chunkFilename: '[name]-[hash].js',
      sourceMapFilename: "[name]-[hash].js.map",
      publicPath: PUBLIC_PATH
    },
    module: {

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
          include: /app/,
          exclue: /node_modules/,
          loaders: ['babel-loader']
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'TextThresher',
        template: './app/assets/index_template.html'
      }),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin(),

      new webpack.DefinePlugin({
        'process.env': {
          BROWSER: JSON.stringify(true),
          NODE_ENV: JSON.stringify('development')
        }
      }),

      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurenceOrderPlugin(),

    ],
    noParse: [bowerPath, 'node_modules']
  }
};
