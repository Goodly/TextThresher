import { Block } from '../model/Block';

const debug = require('debug')('thresher:TextSpanner');

export function makeOffsetsFromWhiteSpace(text) {
  // Must create RegExp on every call to init lastIndex.
  const tokenDelimiter = /\s+/g
  let tokenOffsets = [];
  let found;
  let start = 0;
  while ((found = tokenDelimiter.exec(text)) !== null) {
    tokenOffsets.push({start, end: found.index});
    start = tokenDelimiter.lastIndex;
  };
  // If text does not end with white space, add last segment.
  // If no white space in text, will add entire text as a block.
  if (start < text.length) {
    tokenOffsets.push({start, end: text.length});
  };
  return tokenOffsets;
};

export function makeOffsetsFromLineBreaks(text) {
  // Must create RegExp on every call to init lastIndex.
  const lineBreak = /\r\n?|\n/g
  let lineOffsets = [];
  let found;
  let start = 0;
  while ((found = lineBreak.exec(text)) !== null) {
    lineOffsets.push({start, end: found.index});
    start = lineBreak.lastIndex;
  };
  // If text does not end with line break, add last segment.
  // If no line breaks, will add entire text as a block.
  if (start < text.length) {
    lineOffsets.push({start, end: text.length});
  };
  return lineOffsets;
};

export function makeBlocksFromOffsets(lineOffsets) {
  return lineOffsets.map( (offset) => new Block({
    blockType: 'unstyled',
    start: offset.start,
    end: offset.end,
    depth: 0,
    config: {}
  }));
}
