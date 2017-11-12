import { Record } from 'immutable';

import generateRandomKey from '../utils/generateRandomKey';

const debug = require('debug')('thresher:TextSpanner');

const defaultAnnotationRecord = {
  key: '',
  start: 0,
  end: 0,
  text: '',
  source: {}
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
        + String(start) + "," + String(end) + "], "
        + this.source.fullLabel());
    };
    if (text.substring(start, end) !== this.text) {
      let msg = ("Annotation does not match offsets: ["
        + String(start) + "," + String(end) + "], "
        + this.source.fullLabel()
        + " Expected: '" + this.text
        + "' Found: '" + text.substring(start, end)
        + "'");
      // When "WHEN" annotations are fixed, can throw error always
      if (this.source.layerType === "HINT"  &&
          this.source.hintType  === "WHEN") {
        debug(msg);
      } else {
        throw new Error(msg);
      };
    };
  }
}
