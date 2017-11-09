import { Record } from 'immutable';

import generateRandomKey from '../utils/generateRandomKey';

const debug = require('debug')('thresher:TextSpanner');

export class ContentState {
  constructor() {
    this._text = "";
    this.setText = this._setText.bind(this);
    this.getText = this._getText.bind(this);
    this._tokenOffsets = null;
    this.setTokenization = this._setTokenization.bind(this);
    this.getTokenization = this._getTokenization.bind(this);
  }

  _setText(text) {
    this._text = text;
  }

  _getText() {
    return this._text;
  }

  _setTokenization(tokenOffsets) {
    this._tokenOffsets = tokenOffsets;
  }

  _getTokenization() {
    return this._tokenOffsets;
  }

}
