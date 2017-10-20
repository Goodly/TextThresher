import { Record } from 'immutable';

import generateRandomKey from '../utils/generateRandomKey';

import { ContentState } from './ContentState';
import { DisplayState } from './DisplayState';
import { LayerState } from './LayerState';

const debug = require('debug')('thresher:TextSpanner');

export class EditorState {
  constructor() {
    this.setText = this._setText.bind(this);
    this.getText = this._getText.bind(this);
    this._contentState = new ContentState();
    this.createDisplayState = this._createDisplayState.bind(this);
    this._displayStateMap = new Map();
    this.createLayerState = this._createLayerState.bind(this);
    this._layerStateMap = new Map();
    this.generateCharacterClasses = this._generateCharacterClasses.bind(this);
    // This map key is the displayState key. This caches the characterClasses for
    // each displayState. A displayState is a selection of which layers
    // to display.
    this._characterClasses = new Map();
  }

  static createEmpty() {
    return new EditorState();
  }

  _getText() {
    return this._contentState.getText();
  }

  _setText(text) {
    this._contentState.setText(text);
    return this;
  }

  _createDisplayState() {
    let displayState = new DisplayState();
    let key = displayState.getKey();
    this._displayStateMap.set(key, displayState);
    debug(`created DisplayState ${key}`)
    return displayState;
  }

  _createLayerState(layerLabelData) {
    let layerState = new LayerState(layerLabelData);
    let key = layerState.getKey();
    this._layerStateMap.set(key, layerState);
    debug(`created LayerState ${key}`)
    return layerState;
  }

  _generateCharacterClasses(displayState) {
    let text = this.getText();
    let charClasses = Array.from(new Array(text.length), (_, index) => new Array() );
    // This returns layers in the order they were added.
    // n.b. temporary, layer sequencing will be from displayState
    for (let layer of this._layerStateMap.values()) {
      for (let annotation of layer.getAnnotationList()) {
        for (let i=annotation.start; i < annotation.end; i++) {
          charClasses[i].push(annotation.key);
        };
      };
    }
    // Now group spans with same layers
    let spans = [];
    let spanStart = 0;
    let spanLayers = charClasses[spanStart];
    for (let k=0; k < charClasses.length; k++) {
      if ( ! eqArray(spanLayers, charClasses[k])) {
        if (spanLayers.length > 0) {
          let spanShouldBe = text.substring(spanStart, k);
          spans.push({start: spanStart, end: k, spanLayers, spanShouldBe});
        };
        spanStart = k;
        spanLayers = charClasses[spanStart];
      };
    };
    if (spanLayers.length > 0) {
      let spanShouldBe = text.substring(spanStart, charClasses.length);
      spans.push({start: spanStart, end: charClasses.length, spanLayers, spanShouldBe});
    };
    this._characterClasses[displayState.key] = spans;
    debug(spans);
  }
}

function eqArray(as, bs) {
  if (as.length !== bs.length) return false;
  for (let i=0; i < as.length; i++) {
    if (as[i] !== bs[i]) return false;
  };
  return true;
};
