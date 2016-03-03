import { ADD_HIGHLIGHT, NEW_ARTICLE } from '../actions/actionTypes';
import data from 'assets/tua.json';

// Note: not 100% sure this is the 'proper' reducer layout - we'll find out more
// as we go

const initialState = {
  // For testing purposes there will be a default static article
  article: data.results,
  highlights: [],
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
    case NEW_ARTICLE:
      // TODO: save highlights before deleting htem
      return Object.assign({}, state, { article: action.article, highlights: [] });
    default:
      return state;
  }
}
