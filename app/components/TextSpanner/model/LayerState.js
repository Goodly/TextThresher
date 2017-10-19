import { Record } from 'immutable';

import { LayerLabel } from './LayerLabel';
import { Annotation } from './Annotation';

import generateRandomKey from '../utils/generateRandomKey';

const debug = require('debug')('thresher:TextSpanner');

const defaultLayerStateRecord = {
};

const LayerStateRecord = Record(defaultLayerStateRecord);

export class LayerState extends LayerStateRecord {
  constructor(layerLabelValues) {
    super();
    this.getKey = this._getKey.bind(this);
    this._key = generateRandomKey();
    this.layerLabel = new LayerLabel(layerLabelValues);
    this._annotationList = [];
    this.addAnnotation = this._addAnnotation.bind(this);
    this.getAnnotationList = this._getAnnotationList.bind(this);
  }

  _getKey() {
    return this._key;
  }

  _getAnnotationList(text) {
    return this._annotationList;
  }

  _addAnnotation({topicName, caseNumber, start, end, contributor, extra}) {
    const annotation = new Annotation({
      contributor,
      topicName,
      caseNumber,
      start,
      end,
      extra,
    });
    debug(`created Annotation ${annotation['key']}`)
    debug(annotation);
    this._annotationList.push(annotation);
    return this;
  }
}
