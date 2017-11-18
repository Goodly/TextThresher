import { Record } from 'immutable';

import generateRandomKey from 'components/TextSpanner/utils/generateRandomKey';

const debug = require('debug')('thresher:TextSpanner');

export const QuizLayerTypes = {
  'HINT': 'HINT',
  'TOPIC': 'TOPIC',
  'ANSWER': 'ANSWER',
}

// A union record type, layerType indicates which variable is set.
const defaultQuizLayerLabelRecord = {
  layerType: 'ANSWER',
  hintType: '',
  topicName: '',
  answer_id: 0,
  question_id: 0,
  question_number: 0,
}

const QuizLayerLabelRecord = Record(defaultQuizLayerLabelRecord);

export class QuizLayerLabel extends QuizLayerLabelRecord {
  constructor(layerLabel) {
    layerLabel['key'] = generateRandomKey();
    super(layerLabel);
    this.shortLabel = this.shortLabel.bind(this);
    this.fullLabel = this.fullLabel.bind(this);
  }

  shortLabel() {
    let label = '';
    switch (this.layerType) {
      case QuizLayerTypes.HINT:
        label = "Hint: " + this.hintType;
        break;
      case QuizLayerTypes.TOPIC:
        label = "Topic: " + this.topicName;
        break;
      case QuizLayerTypes.ANSWER:
        label = "Question: " + String(this.question_number);
        break;
    };
    return label;
  }

  fullLabel() {
    let label = this.shortLabel();
    if (this.layerType === QuizLayerTypes.ANSWER) {
      label += " q_id:" + String(this.question_id);
      label += " a_id:" + String(this.answer_id);
    };
    return label;
  };
}

export function sortLabelsByAnswerId(a, b) {
  return a.answer_id - b.answer_id;
}

export function sortLayersByAnswerId(a, b) {
  return sortLabelsByAnswerId(a.layerLabel, b.layerLabel);
}

export function moveAnswerToTop(layers, answer_id) {
  let position = layers.findIndex( (layer) => {
    return (layer.layerLabel.layerType === QuizLayerTypes.ANSWER &&
            layer.layerLabel.answer_id === answer_id);
  });
  if (position !== -1) {
    // Don't mutate input parameter
    layers = Array.from(layers);
    let extracted = layers.splice(position, 1);
    layers = layers.concat(extracted);
  };
  return layers;
}
