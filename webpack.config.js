'use strict';
require('babel-register');

/* Select the proper webpack config based on NODE_ENV */

/* eslint complexity: [1, 3] */
function config() {
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

module.exports = require(`./webpack/${config()}`)
