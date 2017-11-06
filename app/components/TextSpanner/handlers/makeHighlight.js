const debug = require('debug')('thresher:TextSpanner');

export function handleMakeHighlight(blockMaker) {
  let selectionObj = window.getSelection();
  if (selectionObj && selectionObj.anchorNode && selectionObj.extentNode) {
    let highlight = getHighlight(selectionObj, blockMaker);
    if (highlight !== null) {
    };
    //removes selection after creating highlight
    window.getSelection().removeAllRanges();
  };
}

function getElement(node) {
  // If nodeType is TEXT_NODE, return the parent.
  if (node.nodeType !== node.DOCUMENT_NODE) {
    node = node.parentNode;
  };
  return node;
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
    // Swap ends if drag went from right-to-left
    if (start > end) {
      let temp = start;
      start = end;
      end = temp;
    };
    // Move to nearest token boundaries
    start = blockMaker.lookLeft(start, 0);
    end = blockMaker.lookRight(end, 0);
    let selectedText = blockMaker.getText().substring(start, end);
    return {start, end, text: selectedText}
  };
  return null;
}
