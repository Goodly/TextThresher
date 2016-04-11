import { ADD_HIGHLIGHT,
         NEW_ARTICLE,
         ACTIVATE_TOPIC } from '../actions/actionTypes';
import data from 'assets/tua.json';

// Note: not 100% sure this is the 'proper' reducer layout - we'll find out more
// as we go

const initialState = {
  // For testing purposes there will be a default static article
  article: data.results,
  highlights: [],
}

function mergeHighlights(list) {
  // TODO: write tests for me
  var newlist = [];
  var n = list.length;
  for (var i = 0; i < n;) {
    var newrange = Object.assign({}, list[i]);
    for (var j = i + 1; j < n; j++) {
      if (list[i].end >= list[j].start) {
        newrange.text += list[j].text.substring(
          Math.min(newrange.end, list[j].end) - list[j].start, list[j].end
        );
        newrange.end = Math.max(list[j].end, newrange.end);
        continue;
      } else {
        break;
      }
    }
    i = j;
    newlist.push(newrange);
  }
  return newlist;
}

export default function articleReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_HIGHLIGHT:
      var newHighlights = state.highlights.concat(
        { start: action.selection.start,
          end: action.selection.end,
          text: action.selection.selectedText,
          topic: state.currentTopic }
      ).sort((a,b) => {
        if (a.start === b.start) {
          return 0;
        } else if (a.start < b.start) {
          return -1;
        } else {
          return 1;
        }
      });
      return Object.assign({}, state,
                           { highlights: mergeHighlights(newHighlights) });
    case NEW_ARTICLE:
      // TODO: save highlights before deleting htem
      return Object.assign({}, state, { article: action.article, highlights: [] });

    case ACTIVATE_TOPIC:
      return Object.assign({}, state, { currentTopic: action.topic });

    default:
      return state;
  }
}
