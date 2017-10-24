import { Record } from 'immutable';

import generateRandomKey from '../utils/generateRandomKey';

import { ContentState } from './ContentState';
import { DisplayState } from './DisplayState';
import { LayerState } from './LayerState';
import { SpanSegment } from './SpanSegment';

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
    this._characterClasses = [];
    this.getSpans = this._getSpans.bind(this);
    this._spansForDisplayState = new Map();
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

  // Note there can be multiple displayStates, which specify
  // hierarchical blocks to display and an ordering of these layers
  // for merging styles.
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

  // This generates and caches the characterClasses which is dependent only
  // on the ContentState and un-ordered LayerState.
  // (Ordering of layers for rendering is controlled by DisplayState.)
  _generateCharacterClasses() {
    let text = this.getText();
    let charClasses = Array.from(new Array(text.length), (_, index) => new Array() );
    for (let layer of this._layerStateMap.values()) {
      for (let annotation of layer.getAnnotationList()) {
        // Throw if we get bad start/end
        let start = Math.min(annotation.start, text.length);
        let end = Math.min(annotation.end, text.length);
        for (let i=start; i < end; i++) {
          charClasses[i].push(annotation.topicName);
        };
      };
    }
    this._characterClasses = charClasses;
  }

  // Group characters into contiguous spans with same layers
  // Cache by block key, as this result is a function
  // of the block.start and block.end values.
  _getSpans(block) {
    let {start, end} = block;
    // If we already computed this, return the cached version
    if (this._spansForDisplayState.has(block.key)) {
      return this._spansForDisplayState.get(block.key);
    };
    let text = this.getText();
    let charClasses = this._characterClasses;
    let spans = [];
    let spanStart = start;
    // Should throw error if !end<charClasses.length
    end = Math.min(end, charClasses.length);
    let spanAnnotations = charClasses[spanStart];
    for (let k=start; k < end; k++) {
      if ( ! eqArray(spanAnnotations, charClasses[k])) {
        let spanShouldBe = text.substring(spanStart, k);
        spans.push(new SpanSegment(
          {start: spanStart, end: k, spanAnnotations, spanShouldBe}
        ));
        spanStart = k;
        spanAnnotations = charClasses[spanStart];
      };
    };
    let spanShouldBe = text.substring(spanStart, end);
    spans.push(new SpanSegment(
      {start: spanStart, end, spanAnnotations, spanShouldBe}
    ));
    this._spansForDisplayState.set(block.key, spans);
    return spans;
  }
}

function eqArray(as, bs) {
  if (as.length !== bs.length) return false;
  for (let i=0; i < as.length; i++) {
    if (as[i] !== bs[i]) return false;
  };
  return true;
};
