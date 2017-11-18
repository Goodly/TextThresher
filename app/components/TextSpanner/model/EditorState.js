import { Record } from 'immutable';

import generateRandomKey from '../utils/generateRandomKey';

import { ContentState } from './ContentState';
import { DisplayState } from './DisplayState';
import { LayerState } from './LayerState';
import { SpanSegment } from './SpanSegment';

const debug = require('debug')('thresher:TextSpanner');

export class EditorState {
  constructor() {
    this._cacheID = generateRandomKey();
    this.resetCaches = this._resetCaches.bind(this);
    this.setText = this._setText.bind(this);
    this.getText = this._getText.bind(this);
    this.setTokenization = this._setTokenization.bind(this);
    this.getTokenization = this._getTokenization.bind(this);
    this._contentState = new ContentState();
    this.createDisplayState = this._createDisplayState.bind(this);
    this.createLayerState = this._createLayerState.bind(this);
    this.getLayers = this._getLayers.bind(this);
    this._layerStateMap = new Map();
    this.cacheInvalid = this._cacheInvalid.bind(this);
    this.collectCharacterAnnotations = this._collectCharacterAnnotations.bind(this);
    this._charAnnotations = null; // will be array of arrays
    this.getSpans = this._getSpans.bind(this);
    this._spansForDisplayState = new Map();
  }

  static createEmpty() {
    return new EditorState();
  }

  _resetCaches() {
    this._cacheID = generateRandomKey();
    this._charAnnotations = null; // will be array of arrays
  }

  _getText() {
    return this._contentState.getText();
  }

  _setText(text) {
    this._contentState.setText(text);
    this.resetCaches();
    return this;
  }

  _getTokenization() {
    return this._contentState.getTokenization();
  }

  _setTokenization(tokenOffsets) {
    this._contentState.setTokenization(tokenOffsets);
    this.resetCaches();
    return this;
  }

  // Convenience factory function to make DisplayStates.
  // There can be multiple displayStates. Pass them to Spanner
  // to specify which blocks to render and the order
  // to use for merging layer styles.
  _createDisplayState() {
    return new DisplayState();
  }

  _createLayerState(layerLabelData) {
    let layerState = new LayerState(layerLabelData);
    let key = layerState.key;
    this._layerStateMap.set(key, layerState);
    return layerState;
  }

  _getLayers() {
    return Array.from(this._layerStateMap.values());
  };

  // This generates and caches the characterClasses.
  // This is an array of arrays with the annotations for each
  // character in the text. This is dependent only
  // on the ContentState and un-ordered LayerState.
  // (Ordering of layers for rendering is controlled by DisplayState.)
  _collectCharacterAnnotations() {
    let text = this.getText();
    let charAnnotations = Array.from(new Array(text.length), (_, index) => new Array() );
    this._cacheID = generateRandomKey();
    for (let layer of this._layerStateMap.values()) {
      // n.b. cacheID is checked by _cacheInvalid()
      layer.setCacheID(this._cacheID);
      for (let annotation of layer.getAnnotationList()) {
        annotation.validate(text);
        for (let i=annotation.start; i < annotation.end; i++) {
          charAnnotations[i].push(annotation.key);
        };
      };
    }
    this._charAnnotations = charAnnotations;
  }

  _cacheInvalid() {
    if (this._charAnnotations === null) {
      return true;
    };
    // Layers reset their cacheID on every mutation.
    // So if any layer cacheID does not match the current cacheID
    // the current this._charAnnotations cache is invalid.
    return this.getLayers().some(
      (layer) => layer.getCacheID() !== this._cacheID
    );
  }

  // Group characters into contiguous spans with same layers
  // Cache by block key, as this result is a function
  // of the block.start and block.end values.
  _getSpans(block) {
    let text = this.getText();
    if (text.length === 0) {
      return [];
    };
    // If we already computed this, return the cached version
    if (this._spansForDisplayState.has(block.key)) {
      return this._spansForDisplayState.get(block.key);
    };
    // See if we need to build the array of annotations per character
    if (this.cacheInvalid()) {
      this.collectCharacterAnnotations();
    };
    let {start, end} = block;
    if (start < 0 || start >= text.length || end < 0 || end > text.length) {
      throw new Error("Invalid offsets in block: ["
        + String(start) + "," + String(end) + "]");
    };
    let charAnnotations = this._charAnnotations;
    let spans = [];
    let spanStart = start;
    let spanAnnotations = charAnnotations[spanStart];
    for (let k=start; k < end; k++) {
      if ( ! eqArray(spanAnnotations, charAnnotations[k])) {
        let spanShouldBe = text.substring(spanStart, k);
        spans.push(new SpanSegment(
          {start: spanStart, end: k, spanAnnotations, spanShouldBe}
        ));
        spanStart = k;
        spanAnnotations = charAnnotations[spanStart];
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
