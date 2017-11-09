import { Record } from 'immutable';

import generateRandomKey from '../utils/generateRandomKey';

const debug = require('debug')('thresher:TextSpanner');

const defaultAnnotationRecord = {
  key: '',
  topicName: '',
  topicOrder: 0,
  caseNumber: 0,
  start: 0,
  end: 0,
  contributor: {},
  extra: {},
}

const AnnotationRecord = Record(defaultAnnotationRecord);

export class Annotation extends AnnotationRecord {
  constructor(annotation) {
    annotation['key'] = generateRandomKey();
    super(annotation);
  }
}
