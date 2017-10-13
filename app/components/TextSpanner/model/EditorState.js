import generateRandomKey from '../utils/generateRandomKey';

let debug = require('debug')('thresher:TextSpanner');

export class EditorState {
  constructor() {
    this.createDisplayState = this._createDisplayState.bind(this);
    this.displayStateMap = new Map();
  }

  static createEmpty() {
    return new EditorState();
  }

  _createDisplayState() {
    let displayState = new DisplayState();
    let key = displayState.getKey();
    this.displayStateMap[key] = displayState;
    debug(`created DisplayState ${key}`)
    return displayState;
  }
}

class DisplayState {
  constructor() {
    this.getKey = this._getKey.bind(this);
    this._key = generateRandomKey();
  }

  _getKey() {
    return this._key;
  }
}
