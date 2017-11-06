import { Record } from 'immutable';

import { Annotation } from './Annotation';

import generateRandomKey from '../utils/generateRandomKey';

const debug = require('debug')('thresher:TextSpanner');

const defaultLayerStateRecord = {
  key: '',
};

const LayerStateRecord = Record(defaultLayerStateRecord);

export class LayerState extends LayerStateRecord {
  constructor(layerLabel) {
    super({key: generateRandomKey()});
    this.layerLabel = layerLabel;
    this._annotationList = [];
    this.addAnnotation = this._addAnnotation.bind(this);
    this.getAnnotationList = this._getAnnotationList.bind(this);
  }

  _getAnnotationList() {
    return this._annotationList;
  }

  _addAnnotation(initializer) {
    const annotation = new Annotation(initializer);
    this._annotationList.push(annotation);
    return this;
  }
}
