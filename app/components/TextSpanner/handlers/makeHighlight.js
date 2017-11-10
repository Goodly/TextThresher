const debug = require('debug')('thresher:TextSpanner');

export function handleMakeHighlight() {
  let selectionObj = window.getSelection();
  let articleHighlight = null;
  if (selectionObj && selectionObj.anchorNode && selectionObj.extentNode) {
    // If no selection, just a click, return null.
    if (selectionObj.anchorNode === selectionObj.extentNode &&
        selectionObj.anchorOffset === selectionObj.extentOffset) {
      return null;
    }
    articleHighlight = getHighlight(selectionObj);
    //remove selection after creating highlight
    window.getSelection().removeAllRanges();
  };
  return articleHighlight;
}

function getHighlight(selectionObj) {
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
    // Swap ends if drag went from right-to-left
    if (start > end) {
      let temp = start;
      start = end;
      end = temp;
    };
    return {start, end}
  };
  return null;
}

export function moveToTokenBoundaries(blockMaker, articleHighlight) {
  if (articleHighlight !== null) {
    let {start, end} = articleHighlight;
    start = blockMaker.lookLeft(start, 0);
    end = blockMaker.lookRight(end, 0);
    if (start < end) {
      let selectedText = blockMaker.getText().substring(start, end);
      return {start, end, text: selectedText}
    };
  };
  return articleHighlight;
}

function getElement(node) {
  // If nodeType is TEXT_NODE, return the parent.
  if (node.nodeType !== node.DOCUMENT_NODE) {
    node = node.parentNode;
  };
  return node;
}
