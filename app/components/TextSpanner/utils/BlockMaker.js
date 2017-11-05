import { makeBlocksFromOffsets } from '../utils';

/* The main purpose of this class is to take an arbitrary number of
 * annotation layers, flatten them into a possibly disjoint selection of
 * characters in the text, expand those selection(s) by a specified number of
 * context tokens on either side of the selection(s), and return them
 * as a coalesced list of non-overlapping blocks.
 * Because this routine accepts a set of externally provided offsets as
 * the tokenization, you can provide tokenization for languages that do not
 * use spaces to delimit words.
*/
export class BlockMaker {
  constructor() {
    // _tokenOffsets must be an array of objects with start and end keys.
    // [{start:1, end:9}, {start:12, end:14}]
    this._tokenOffsets = [];
    this._text = '';
    this._charToToken = [];
    this._selectedChars = [];
    this.setTokenization = this._setTokenization.bind(this)
    this.combineLayers = this._combineLayers.bind(this);
    this.lookLeft = this._lookLeft.bind(this);
    this.lookRight = this._lookRight.bind(this);
    this._expandSelection = this._expandSelection.bind(this);
    this.getBlocksWithContext = this._getBlocksWithContext.bind(this);
  }

  _setTokenization(text, tokenOffsets) {
    this._text = text;
    this._tokenOffsets = tokenOffsets;
    // Create a data structure parallel to text for looking up token numbers
    // "The quick brown fox"
    // "000-11111-22222-333" (dash is -1)
    let charToToken = new Array(text.length).fill(-1);
    tokenOffsets.forEach( (offset, index) => {
      for (let i = offset.start; i < offset.end; i++) {
        charToToken[i] = index;
      };
    });
    this._charToToken = charToToken;
  }

  _combineLayers(layerStateArray) {
    // Create a data structure parallel to text like:
    // "The quick brown fox"
    // "fffftttttfffffffttt" where true is set for selected characters.
    // Selections can be discontiguous.
    // All layers passed in are merged to make the selection.
    let selectedChars = new Array(this._text.length).fill(false);
    for (let layer of layerStateArray) {
      for (let annotation of layer.getAnnotationList()) {
        annotation.validate(this._text);
        for (let i=annotation.start; i < annotation.end; i++) {
          selectedChars[i] = true;
        };
      };
    };
    this._selectedChars = selectedChars;
  }

  _lookLeft(start, contextWords) {
    let charToToken = this._charToToken;
    let tokenOffsets = this._tokenOffsets;
    if (tokenOffsets.length === 0) {
      return start;
    };

    // If we landed between tokens, look left for token number.
    let onToken = 0;
    let correct_for_start = 0;
    while ((start >= 0) && (onToken = charToToken[start]) < 0) {
      start--;
      correct_for_start = 1;
    };
    let goalToken = Math.max(0, onToken - contextWords - correct_for_start);
    return tokenOffsets[goalToken].start;
  }

  _lookRight(end, contextWords) {
    let charToToken = this._charToToken;
    let tokenOffsets = this._tokenOffsets;
    if (tokenOffsets.length === 0) {
      return end;
    };

    // If we landed between tokens, look right for token number.
    let lastToken = tokenOffsets.length - 1;
    let onToken = lastToken;
    let correct_for_start = 0;
    while ((end < charToToken.length) && (onToken = charToToken[end]) < 0) {
      end++;
      correct_for_start = 1;
    };
    if (onToken === -1) {
      onToken = lastToken;
    }
    let goalToken = Math.min(lastToken, onToken + contextWords - correct_for_start);
    return tokenOffsets[goalToken].end;
  }

  _expandSelection(selectionOffsets, contextWords) {
    let selectedChars = Array.from(this._selectedChars);
    let charToToken = this._charToToken;
    for (let offset of selectionOffsets) {
      let leftTokenIndex = this.lookLeft(offset.start, contextWords);
      let rightTokenIndex = this.lookRight(offset.end, contextWords);
      for (let i=leftTokenIndex; i < rightTokenIndex; i++) {
        selectedChars[i] = true;
      };
    };
    return selectedChars;
  }

  _getBlocksWithContext(contextWords) {
    // Get ranges that match the current annotations combined
    let selectionOffsets = getSelectionOffsets(this._selectedChars);
    // Now expand each of these ranges by the number of context words
    let selectedChars = this._expandSelection(selectionOffsets, contextWords);
    // Now gather the new expanded ranges, that may have coalesced into fewer
    // blocks.
    selectionOffsets = getSelectionOffsets(selectedChars);
    return makeBlocksFromOffsets(selectionOffsets);
  }
}

function getSelectionOffsets(selectedChars) {
  let selectionOffsets = [];
  let start=0;
  let end=0;
  let currSelected, prevSelected=false;
  for (let i=0; i < selectedChars.length; i++) {
    currSelected = selectedChars[i];
    if (currSelected === true) {
      end = i + 1;
    }
    if (prevSelected === true && currSelected === false) {
      selectionOffsets.push({start, end});
    };
    if (currSelected === false) {
      start = i + 1;
    };
    prevSelected = currSelected;
  };
  // If last character was selected, finish adding last span.
  if (prevSelected === true) {
    selectionOffsets.push({start, end});
  };
  return selectionOffsets;
}
