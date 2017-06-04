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
};

function execCmd(command) {
  console.log('\n');
  console.log(command);
  // If err, throw and halt immediately.
  child_process.execSync(command, { cwd: PATHS.dist, timeout: 5000 });
};

const config = {
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
    modules: [PATHS.app, 'node_modules'],
    extensions: ['.js', '.jsx']
  },
  output: {
    path: PATHS.dist,
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js',
    sourceMapFilename: "[name].bundle.js.map",
    publicPath: PUBLIC_PATH
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'autoprefixer-loader',
            options: {
              browsers: 'last 2 version'
            }
          },
          {
            loader: 'sass-loader',
            options: {
              outputStyle: 'expanded',
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.jpg$/,
        use: [
          {
            loader: 'file-loader'
          }
        ]
      },
      {
        test: /\.(jpe?g|png|gif|woff(2)?|eot|otf)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: '10000',
              name: "[sha512:hash:base64:7].[ext]"
            }
          }
        ]
      },
      {
        test: /\.(svg|ttf)$/,
        include: path.resolve(buildPath, './app/styles/fonts'),
        use: [
          {
            loader: 'file-loader'
          }
        ]
      },
      {
        test: /\.js$/,
        include: [/app/, /test/],
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            }
          }
        ],
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        BROWSER: JSON.stringify(true),
      }
    }),
    new HtmlWebpackPlugin({
      title: 'TextThresher',
      template: './app/templates/index_template.html',
      chunks: ['app'],
      chunksSortMode: 'dependency',
      filename: 'index.html',
    }),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
  externals: {
    'cheerio': 'window',
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': true
  }
};
// See https://webpack.js.org/configuration/devtool/#devtool
// cheap-module-source-map is 5% smaller and 5 seconds vs 9 seconds
// on my AWS t2.medium
// eslint-disable-next-line no-process-env
if (process.env.INLINE) {
  // Inline pushes quiz.bundle.js over 5MB, the Pybossa upload limit
  config.devtool = 'inline-source-map'
}

// eslint-disable-next-line no-process-env
if (process.env.ESLINT) {
  config.module.rules.unshift(
    {
      enforce: 'pre',
      test: /\.js$/,
      include: [PATHS.app],
      use: [
        {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          }
        },
        {
          loader: 'eslint-loader',
          options: {
            cache: true
          }
        }
      ],
    }
  );
}

// Don't clean dist if we are just running webpack server with 'npm run dev'
if (process.env.CLEANDIST) {
  config.plugins.push(
    new CleanWebpackPlugin(['dist/*'], {
      root: PATHS.buildPath,
      verbose: true,
      dry: false,
      exclude: []
    }),
    new OnBuildPlugin(function () {
      // copy files from the 'app/staticroot/' dir
      execCmd(`cp -arv ${PATHS.app}/staticroot/* ${PATHS.dist}`); // */
      console.log('\n');
    })
  )
}

module.exports = config;
