const debug = require('debug')('thresher:TextSpanner');

export function findLineBreaks(text) {
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

export function displayLinesAsBlocks(displayState, text) {
  let lineOffsets = findLineBreaks(text);
  lineOffsets.forEach( (offset) => {
    displayState.addBlock({
      blockType: 'unstyled',
      start: offset.start,
      end: offset.end,
      depth: 0,
      config: {}
    });
  });
  return displayState;
}
