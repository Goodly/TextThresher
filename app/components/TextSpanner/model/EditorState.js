import { Record } from 'immutable';

import generateRandomKey from '../utils/generateRandomKey';

import { ContentState } from './ContentState';

const debug = require('debug')('thresher:TextSpanner');

export class EditorState {
  constructor() {
    this.createDisplayState = this._createDisplayState.bind(this);
    this.setText = this._setText.bind(this);
    this.getText = this._getText.bind(this);
    this.addBlock = this._addBlock.bind(this);
    this.getBlockList = this._getBlockList.bind(this);
    this.displayStateMap = new Map();
    this.contentState = new ContentState();
  }

  static createEmpty() {
    return new EditorState();
  }

  _setText(text) {
    this.contentState.setText(text);
  }

  _getText() {
    return this.contentState.getText();
  }

  _addBlock(blockType, start, end, depth, config) {
    this.contentState.addBlock(blockType, start, end, depth, config);
  }

  _getBlockList() {
    return this.contentState.getBlockList();
  }


  _createDisplayState() {
    let displayState = new DisplayState();
    let key = displayState.getKey();
    this.displayStateMap[key] = displayState;
    debug(`created DisplayState ${key}`)
    return displayState;
  }
}

const defaultDisplayStateRecord = {
  visibleLayers: [],
}

const DisplayStateRecord = Record(defaultDisplayStateRecord);

export class DisplayState extends DisplayStateRecord {
  constructor() {
    super();
    this.getKey = this._getKey.bind(this);
    this._key = generateRandomKey();
  }

  _getKey() {
    return this._key;
  }
}
