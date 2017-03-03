'use strict';
require('babel-register');

/* Select the proper webpack config based on NODE_ENV */

/* eslint complexity: [1, 3] */
function get_config() {
  // eslint-disable-next-line no-process-env
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'prod.config.js';
    case 'test':
      return 'test.config.js';
    default:
      return 'dev.config.js';
  }
}

var config = require(`./webpack/${get_config()}`)

if (process.env.INLINE) {
  // This pushes quiz.bundle.js over 5MB, the Pybossa upload limit
  config.devtool = 'cheap-module-inline-source-map'
} else {
  // Separate source map is the default
  config.devtool = '#cheap-module-source-map'
}

module.exports = config
