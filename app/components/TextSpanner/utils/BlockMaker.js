import { makeBlocksFromOffsets } from '../utils';

/* The main purpose of this class is to take an arbitrary number of
 * annotation layers, flatten them into a possibly disjoint selection of
 * characters in the text, expand those selection(s) by a specified number of
 * context tokens on either side of the selection(s), and return them
 * as a coalesced list of non-overlapping blocks.
 * Because this algorithm accepts a set of externally provided offsets as
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
    this.getText = this._getText.bind(this);
    this.combineLayers = this._combineLayers.bind(this);
    this.lookLeft = this._lookLeft.bind(this);
    this.lookRight = this._lookRight.bind(this);
    this._expandSelection = this._expandSelection.bind(this);
    this.getBlocksWithContext = this._getBlocksWithContext.bind(this);
  }

  /* Save the text and tokenOffsets for future computation.
   * Then create an array parallel to the text for looking up token numbers:
   * "The quick brown fox"
   * "000-11111-22222-333" (dash is -1)
   */
  _setTokenization(text, tokenOffsets) {
    this._text = text;
    this._tokenOffsets = tokenOffsets;
    let charToToken = new Array(text.length).fill(-1);
    tokenOffsets.forEach( (offset, index) => {
      for (let i = offset.start; i < offset.end; i++) {
        charToToken[i] = index;
      };
    });
    this._charToToken = charToToken;
  }

  // Simplifies handleMakeHighlight.
  _getText() {
    return this._text;
  };

  /* Create a data structure parallel to text like:
   * "The quick brown fox"
   * "fffftttttfffffffttt" where true is set for selected characters.
   * Selections can be discontiguous.
   *  All layers passed in are merged to make the selection.
   */
  _combineLayers(layerStateArray) {
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

  /* Given a start position, find the token that start is on.
   * If start is in between tokens, look left for the nearest
   * token number. Then subtract the number of context tokens,
   * and look up the start position of the goal token.
   * If we have to look left for the start token, adjust by 1.
   * Return the start position of the starting context word.
   */
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
    let goalToken = Math.max(0, onToken - contextWords + correct_for_start);
    return tokenOffsets[goalToken].start;
  }

  /* Given an end position, find the token that end is on.
   * If end is in between tokens, look right for the nearest
   * token number. Then add the number of context tokens,
   * and look up the end position of the goal token.
   * If we have to look right for the end token, adjust by 1.
   * Return the end position of the ending context word.
   */
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
    // end always points one character past the selection, but we want to
    // start our check on the actual last character of the selection
    end--;
    while ((end > 0) && (end < charToToken.length)
           && (onToken = charToToken[end]) < 0) {
      end++;
      correct_for_start = 1;
    };
    if (onToken === -1) {
      onToken = lastToken;
    }
    let goalToken = Math.min(lastToken, onToken + contextWords - correct_for_start);
    return tokenOffsets[goalToken].end;
  }

  /* Take an array of offsets, and expand the selection of characters
   * left and right by the number of tokens specified by contextWords.
   * Return the array of selected characters.
   */
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

  /* Put it all together - calculate a minimum set of blocks that coalesces
   * a set of annotations, each expanded by the specified number of tokens.
   * Return an array of Blocks.
   */
  _getBlocksWithContext(contextWords) {
    // Get ranges that match the current annotations combined
    let selectionOffsets = getSelectionOffsets(this._selectedChars);
    // Now expand each of these ranges by the number of context words
    let selectedChars = this._expandSelection(selectionOffsets, contextWords);
    // Now compute the new expanded ranges, that may coalesce into fewer
    // blocks due to the expansion of each selection.
    selectionOffsets = getSelectionOffsets(selectedChars);
    return makeBlocksFromOffsets(selectionOffsets);
  }
}

/* Take an array of booleans representing selections of characters,
 * possibly disjoint.
 * Return the offsets of each range of selected characters.
 */
function getSelectionOffsets(selectedChars) {
  let selectionOffsets = [];
  let start=0;
  let end=0;
  let prevSelected=false;
  for (let i=0; i < selectedChars.length; i++) {
    let currSelected = selectedChars[i];
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
