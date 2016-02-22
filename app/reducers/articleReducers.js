import { ADD_HIGHLIGHT } from '../actions/actionTypes';

// Note: not 100% sure this is the 'proper' reducer layout - we'll find out more
// as we go

const initialState = {
  highlights: []
}

export default function articleReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_HIGHLIGHT:
      // TODO: merge overlapping highlights
      var newHighlights = state.highlights.concat(
        { start: action.selection.start,
          end: action.selection.end,
          text: action.selection.selectedText }
      ).sort((a,b) => {
        if (a.start === b.start) {
          return 0;
        } else if (a.start < b.start) {
          return -1;
        } else {
          return 1;
        }
      });
      return Object.assign({}, state, { highlights: newHighlights });
    default:
      return state;
  }
}
