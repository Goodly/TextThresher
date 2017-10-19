import { Record } from 'immutable';

import generateRandomKey from '../utils/generateRandomKey';

const debug = require('debug')('thresher:TextSpanner');

const defaultBlockRecord = {
  key: '',
  blockType: 'unstyled',
  start: 0,
  end: 0,
  depth: 0,
  options: {}
}

const BlockRecord = Record(defaultBlockRecord);

export class Block extends BlockRecord {
  constructor(block) {
    block['key'] = generateRandomKey();
    super(block);
  }
}
