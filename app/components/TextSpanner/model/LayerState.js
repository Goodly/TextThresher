import { Record } from 'immutable';

import { Annotation } from './Annotation';

import generateRandomKey from '../utils/generateRandomKey';

const debug = require('debug')('thresher:TextSpanner');

const defaultLayerStateRecord = {
  key: '',
  layerLabel: null,
};

const LayerStateRecord = Record(defaultLayerStateRecord);

export class LayerState extends LayerStateRecord {
  constructor(layerLabel) {
    super({key: generateRandomKey(), layerLabel});
    this._annotationList = [];
    this.addAnnotation = this._addAnnotation.bind(this);
    this.deleteAnnotation = this._deleteAnnotation.bind(this);
    this.getAnnotationList = this._getAnnotationList.bind(this);

    this._cacheID = '';
    this.getCacheID = this._getCacheID.bind(this);
    this.setCacheID = this._setCacheID.bind(this);
    this.resetCacheID = this._resetCacheID.bind(this);
  }

  _getAnnotationList() {
    // Return a copy to prevent mutation
    return Array.from(this._annotationList);
  }

  _addAnnotation(initializer) {
    const annotation = new Annotation(initializer);
    this._annotationList.push(annotation);
    this.resetCacheID();
  }

  _deleteAnnotation(match) {
    let filtered = this._annotationList.filter(
      (annotation) => annotation.key !== match.key
    );
    this._annotationList = filtered;
    this.resetCacheID();
  }

  _getCacheID(cacheID) {
    return this._cacheID;
  }

  _setCacheID(cacheID) {
    this._cacheID = cacheID;
  }

  _resetCacheID() {
    this._cacheID = '';
  }
}
