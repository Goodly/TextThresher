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

export function displayLinesAsBlocks(displayState, article_id, database) {
  const article = database.entities.articles[article_id];
  let lineOffsets = findLineBreaks(article.text);
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

export function loadAnnotatedArticle(editorState, article_id, database) {
  const db = database.entities;
  const article = db.articles[article_id];
  editorState = editorState.setText(article.text);
  article.highlight_taskruns.forEach( (taskrun) => {
    taskrun.highlights.forEach( (hg) => {
      let layer = editorState.createLayerState({
        contributor: taskrun.contributor.unique_label,
        topicName: hg.topic_name,
        caseNumber: hg.case_number,
      });
      hg.offsets.forEach( (offset) => {
        layer.addAnnotation({
          contributor: taskrun.contributor.unique_label,
          topicName: hg.topic_name,
          caseNumber: hg.case_number,
          start: offset[0],
          end: offset[1],
          extra: {},
        });
      });
    });
  });
  return editorState;
}
