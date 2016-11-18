'use strict';

import path from 'path';
import fs from 'fs-extra';

export default () => {
  const STATIC_ROOT = path.resolve(__dirname, '../../app/staticroot/');
  const DIST_ROOT = path.resolve(__dirname, '../../dist/');

  try {
    fs.copySync(STATIC_ROOT, DIST_ROOT);
    console.log(`copied '${STATIC_ROOT}' contents to '${DIST_ROOT}'`);
  } catch (err) {
    console.error(err);
  };

};
