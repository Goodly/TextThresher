import { Record } from 'immutable';

import generateRandomKey from '../utils/generateRandomKey';

const debug = require('debug')('thresher:TextSpanner');

export class ContentState {
  constructor() {
    this.setText = this._setText.bind(this);
    this.getText = this._getText.bind(this);
    this.addBlock = this._addBlock.bind(this);
    this.getBlockList = this._getBlockList.bind(this);
    this._text = "";
    this._blockList = [];
  }

  _setText(text) {
    this._text = text;
  }

  _getText() {
    return this._text;
  }

  _addBlock({blockType, start, end, depth, config}) {
    const block = new Block({
      key: generateRandomKey(),
      blockType,
      start,
      end,
      depth,
      config
    });
    debug(`created Block ${block['key']}`)
    debug(block);
    this._blockList.push(block);
  }

  _getBlockList(text) {
    return Array.from(this._blockList);
  }

}

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
    super(block);
  }
}
