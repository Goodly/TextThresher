import * as types from './actionTypes';

export function addHighlight(start, end, selectedText) {
  return { type: types.ADD_HIGHLIGHT, selection: {start, end, selectedText} };
}
