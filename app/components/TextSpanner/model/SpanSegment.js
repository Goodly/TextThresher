import { Record } from 'immutable';

import generateRandomKey from '../utils/generateRandomKey';

const debug = require('debug')('thresher:TextSpanner');

const defaultSpanSegmentRecord = {
  key: '',
  start: 0,
  end: 0,
  spanAnnotations: [],
}

const SpanSegmentRecord = Record(defaultSpanSegmentRecord);

export class SpanSegment extends SpanSegmentRecord {
  constructor(spanSegment) {
    spanSegment['key'] = generateRandomKey();
    super(spanSegment);
  }
}
