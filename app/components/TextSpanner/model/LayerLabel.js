import { Record } from 'immutable';

import generateRandomKey from '../utils/generateRandomKey';

const debug = require('debug')('thresher:TextSpanner');

const defaultLayerLabelRecord = {
  contributor: '',
  topicName: '',
  caseNumber: '',
}

const LayerLabelRecord = Record(defaultLayerLabelRecord);

export class LayerLabel extends LayerLabelRecord {
  constructor(layerLabel) {
    layerLabel['key'] = generateRandomKey();
    super(layerLabel);
  }
}
