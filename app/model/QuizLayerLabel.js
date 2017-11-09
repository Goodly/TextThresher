import { Record } from 'immutable';

import generateRandomKey from 'components/TextSpanner/utils/generateRandomKey';

const debug = require('debug')('thresher:TextSpanner');

export const QuizLayerTypes = {
  'HINT': 'HINT',
  'TOPIC': 'TOPIC',
  'ANSWER': 'ANSWER',
}

const defaultQuizLayerLabelRecord = {
  layerType: 'ANSWER',
  answer_id: 0,
}

const QuizLayerLabelRecord = Record(defaultQuizLayerLabelRecord);

export class QuizLayerLabel extends QuizLayerLabelRecord {
  constructor(layerLabel) {
    layerLabel['key'] = generateRandomKey();
    super(layerLabel);
  }
}

export function sortLabelsByAnswerId(a, b) {
  return a.answer_id - b.answer_id;
}

export function sortLayersByAnswerId(a, b) {
  return sortLabelsByAnswerId(a.layerLabel, b.layerLabel);
}
