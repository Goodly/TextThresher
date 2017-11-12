import { Record } from 'immutable';

import generateRandomKey from 'components/TextSpanner/utils/generateRandomKey';

const debug = require('debug')('thresher:TextSpanner');

const defaultTopicLabelRecord = {
  layerType: 'Topic',
  contributor: '',
  topicName: '',
  topicNumber: 0,
  caseNumber: 0,
}

const TopicLabelRecord = Record(defaultTopicLabelRecord);

export class TopicLabel extends TopicLabelRecord {
  constructor(layerLabel) {
    layerLabel['key'] = generateRandomKey();
    super(layerLabel);
    this.shortLabel = this.shortLabel.bind(this);
    this.fullLabel = this.fullLabel.bind(this);
  }

  shortLabel() {
    let label = '';
    if (this.topicName !== '') {
      label += this.topicName;
    };
    if (this.caseNumber !== 0) {
      label += " case " + String(this.caseNumber);
    }
    if (this.contributor !== '') {
      label += " by " + this.contributor;
    }
    return label;
  }

  fullLabel() {
    return this.layerType +" " + this.shortLabel();
  };
}

function compareStrings(a, b) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

export function sortLabelsByTopicAndCase(a, b) {
  if (a.topicName !== b.topicName) {
    return compareStrings(a.topicName, b.topicName);
  } else {
    return a.caseNumber - b.caseNumber;
  };
}

export function sortLayersByTopicAndCase(a, b) {
  return sortLabelsByTopicAndCase(a.layerLabel, b.layerLabel);
}
