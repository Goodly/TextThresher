'use strict';
require('babel-register');

/* Select the proper webpack config based on NODE_ENV */

/* eslint complexity: [1, 3] */
function get_config() {
  // eslint-disable-next-line no-process-env
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'prod.config.js';
    default:
      return 'base.config.js';
  }
}

var config = require(`./webpack/${get_config()}`)

module.exports = config
