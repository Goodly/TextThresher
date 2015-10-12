'use strict';

import path from 'path';
import debug from 'debug';
import fs from 'fs-extra';

export default () => {
  const ASSETS_PATH = path.resolve(__dirname, '../../app/assets');
  const DIST_ASSETS_PATH = path.resolve(__dirname, '../../dist/assets');

  fs.copy(ASSETS_PATH, DIST_ASSETS_PATH, (err) => {
    if (err) return console.error(err);
      debug('dev')('copied `assets` directory to `dist`');
  })

};
