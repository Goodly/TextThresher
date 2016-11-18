'use strict';

import del from 'del';
import path from 'path';

export default () => {
  const DIST_PATH = path.resolve(__dirname, '../../dist/*');
  del.sync([DIST_PATH]);
  console.log(`cleaned ${DIST_PATH}`);
};
