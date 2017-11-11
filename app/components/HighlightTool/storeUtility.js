import mergeHighlights from 'components/HighlightTool/mergeHighlights';
import overlap from 'components/HighlightTool/overlap';

export function storeHighlight(highlightProps, highlight, currentTopicId, article_text) {
  let {start, end, text} = highlight;
  highlightProps.deselectHighlight();
  // Reducer does a merge...does not factor in caseNum
  highlightProps.addHighlight(start, end, text, currentTopicId, article_text);
  var newHighlight = {
      start,
      end,
      text: text,
      topic: currentTopicId,
      caseNum: 1
  };
  // Now another merge pass?
  var j = 0;
  while (j < highlightProps.highlights.length) {
    if (overlap(newHighlight, highlightProps.highlights[j])) {
      var new_highlight = mergeHighlights([newHighlight, highlightProps.highlights[j]], article_text);
      start = new_highlight[0].start;
      end = new_highlight[0].end;
      text = new_highlight[0].text
      newHighlight = new_highlight[0];
    }
    j+=1;
  }

  var select_highlight = {start, end, text, topic:currentTopicId};
  highlightProps.selectHighlight([select_highlight]);
}
