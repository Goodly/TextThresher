import mergeHighlights from 'components/HighlightTool/mergeHighlights';
import overlap from 'components/HighlightTool/overlap';

export function storeHighlight(highlightProps, highlight, currentTopicId, text) {
  let {start, end, new_text} = highlight;
  highlightProps.deselectHighlight();
  // Reducer does a merge...does not factor in caseNum
  highlightProps.addHighlight(start, end, new_text, currentTopicId, text);
  var newHighlight = {
      start,
      end,
      text: new_text,
      topic: currentTopicId,
      caseNum: 1
  };
  // Now another merge pass?
  var j = 0;
  while (j < highlightProps.highlights.length) {
    if (overlap(newHighlight, highlightProps.highlights[j])) {
      var new_highlight = mergeHighlights([newHighlight, highlightProps.highlights[j]], text);
      start = new_highlight[0].start;
      end = new_highlight[0].end;
      new_text = new_highlight[0].text
      newHighlight = new_highlight[0];
    }
    j+=1;
  }

  var select_highlight = {start, end, text:new_text, topic:currentTopicId};
  highlightProps.selectHighlight([select_highlight]);
}
