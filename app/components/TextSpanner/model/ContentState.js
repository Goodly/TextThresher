import { Record } from 'immutable';

import generateRandomKey from '../utils/generateRandomKey';

const debug = require('debug')('thresher:TextSpanner');

export class ContentState {
  constructor() {
    this._text = "";
    this.setText = this._setText.bind(this);
    this.getText = this._getText.bind(this);
  }

  _setText(text) {
    this._text = text;
  }

  _getText() {
    return this._text;
  }

}
