import { Record } from 'immutable';

import generateRandomKey from '../utils/generateRandomKey';

import { ContentState } from './ContentState';
import { DisplayState } from './DisplayState';

const debug = require('debug')('thresher:TextSpanner');

export class EditorState {
  constructor() {
    this.createDisplayState = this._createDisplayState.bind(this);
    this.setText = this._setText.bind(this);
    this.getText = this._getText.bind(this);
    this.displayStateMap = new Map();
    this.contentState = new ContentState();
  }

  static createEmpty() {
    return new EditorState();
  }

  _getText() {
    return this.contentState.getText();
  }

  _setText(text) {
    this.contentState.setText(text);
    return this;
  }

  _createDisplayState() {
    let displayState = new DisplayState();
    let key = displayState.getKey();
    this.displayStateMap[key] = displayState;
    debug(`created DisplayState ${key}`)
    return displayState;
  }
}
