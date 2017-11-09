import overlap from 'components/HighlightTool/overlap';
import mergeHighlights from 'components/HighlightTool/mergeHighlights';

const debug = require('debug')('thresher:TextSpanner');

export function handleMakeHighlight(blockMaker, highlightProps) {
  let currentTopicId = highlightProps.answer_id;
  let selectionObj = window.getSelection();
  if (selectionObj && selectionObj.anchorNode && selectionObj.extentNode) {
    let highlight = getHighlight(selectionObj, blockMaker);
    if (highlight !== null) {
      let fulltext = blockMaker.getText();
      storeHighlight(highlightProps, highlight, currentTopicId, fulltext);
    };
    //removes selection after creating highlight
    window.getSelection().removeAllRanges();
  };
}

function getHighlight(selectionObj, blockMaker) {
  let anchorNode = getElement(selectionObj.anchorNode);
  anchorNode.normalize();
  let extentNode = getElement(selectionObj.extentNode);
  extentNode.normalize();
  // Refresh selectionObj after normalizing any adjacent text nodes.
  selectionObj = window.getSelection();
  if (anchorNode.hasAttribute("data-offset-start") &&
      extentNode.hasAttribute("data-offset-start")) {
    let startAnchor = Number(anchorNode.getAttribute("data-offset-start"));
    let start = startAnchor + selectionObj.anchorOffset;
    let startExtent = Number(extentNode.getAttribute("data-offset-start"));
    let end = startExtent + selectionObj.extentOffset;
    // Don't turn clicks into a selection
    if (start === end) {
      return null;
    };
    // Swap ends if drag went from right-to-left
    if (start > end) {
      let temp = start;
      start = end;
      end = temp;
    };
    // Move to nearest token boundaries
    start = blockMaker.lookLeft(start, 0);
    end = blockMaker.lookRight(end, 0);
    if (start < end) {
      let selectedText = blockMaker.getText().substring(start, end);
      return {start, end, text: selectedText}
    };
  };
  return null;
}

function getElement(node) {
  // If nodeType is TEXT_NODE, return the parent.
  if (node.nodeType !== node.DOCUMENT_NODE) {
    node = node.parentNode;
  };
  return node;
}

function storeHighlight(highlightProps, highlight, currentTopicId, text) {
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
