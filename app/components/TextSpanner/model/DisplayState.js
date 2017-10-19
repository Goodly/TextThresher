import { Record } from 'immutable';

import { Block } from './Block';

import generateRandomKey from '../utils/generateRandomKey';

const debug = require('debug')('thresher:TextSpanner');

const defaultDisplayStateRecord = {
};

const DisplayStateRecord = Record(defaultDisplayStateRecord);

export class DisplayState extends DisplayStateRecord {
  constructor() {
    super();
    this.getKey = this._getKey.bind(this);
    this._key = generateRandomKey();
    this._blockList = [];
    this.addBlock = this._addBlock.bind(this);
    this.getBlockList = this._getBlockList.bind(this);
  }

  _getKey() {
    return this._key;
  }

  _getBlockList(text) {
    return this._blockList;
  }

  _addBlock({blockType, start, end, depth, config}) {
    const block = new Block({
      blockType,
      start,
      end,
      depth,
      config
    });
    debug(`created Block ${block['key']}`)
    debug(block);
    this._blockList.push(block);
    return this;
  }
}
