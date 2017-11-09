import { Record } from 'immutable';

import generateRandomKey from '../utils/generateRandomKey';

const debug = require('debug')('thresher:TextSpanner');

const defaultAnnotationRecord = {
  key: '',
  topicName: '',
  topicOrder: 0,
  caseNumber: 0,
  answer_id: 0,
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
    this.validate = this._validate.bind(this);
  }

  _validate(text) {
    let start = this.start;
    let end = this.end;
    if (start < 0 || start >= text.length || end < 0 || end > text.length) {
      throw new Error("Invalid offsets in annotation layer: ["
        + String(start) + "," + String(end) + "], topic:"
        + this.annotation.topicName);
    };
    if (this.extra.hasOwnProperty('textShouldBe')) {
      if (text.substring(start, end) !== this.extra.textShouldBe) {
        let msg = ("Annotation does not match offsets: ["
          + String(start) + "," + String(end) + "], Topic: "
          + this.topicName
          + " Expected: '" + this.extra.textShouldBe
          + "' Found: '" + text.substring(start, end)
          + "'");
        // When "WHEN" annotations are fixed, can throw error always
        if (this.topicName === "WHEN") {
          debug(msg);
        } else {
          throw new Error(msg);
        };
      };
    };
  }
}
