export const ADD_HIGHLIGHT = 'ADD_HIGHLIGHT';
export const DELETE_HIGHLIGHT = 'DELETE_HIGHLIGHT';
export const SELECT_HIGHLIGHT = 'SELECT_HIGHLIGHT';
export const DESELECT_HIGHLIGHT = 'DESELECT_HIGHLIGHT';

export const RESIZE_HIGHLIGHT = 'CHANGE_HIGHLIGHT';
export const CHANGE_CASE_HIGHLIGHT = 'CHANGE_CASE_HIGHLIGHT';


export function addHighlight(start, end, selectedText, currentTopic, order) {
  return { type: ADD_HIGHLIGHT, selection: {start, end, selectedText, currentTopic, order} };
}

export function deleteHighlight(source) {
  return { type: DELETE_HIGHLIGHT, highlights: source };
}

export function selectHighlight(source) {
  return { type: SELECT_HIGHLIGHT, highlight: source };
}

export function deselectHighlight() {
  return {type: DESELECT_HIGHLIGHT, highlights: []}
}

/*export function resizeHighlight(highlight, start, end) {
  return {type: RESIZE_HIGHLIGHT, highlight: highlight, start: start, end: end}
}*/

export function changeCaseHighlight(highlight, case_num) {
  return {type: CHANGE_CASE_HIGHLIGHT, highlight: highlight, caseNum: case_num}
}
