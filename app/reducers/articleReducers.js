import { ADD_HIGHLIGHT,
         NEW_ARTICLE,
         ACTIVATE_TOPIC } from '../actions/actionTypes';
import api from '../api.js';

// Note: not 100% sure this is the 'proper' reducer layout - we'll find out more
// as we go

function getInitialState() {
  return { articles: api.getArticles() };
}

const initialState = Object.assign({
  articles: [],
  highlights: [],
  // TODO: somehow track what the user's seen in their sessions not just count
  curArticle: 0,
}, getInitialState());

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
      api.sendHighlights(state.highlights);
      if (!action.article || action.article >= state.articles.length) {
        return Object.assign({}, state, { articles: api.getArticles(),
                                          highlights: [],
                                          curArticle: 0 });
      }
      return Object.assign({}, state, { highlights: [],
                                        curArticle: state.curArticle + 1 });
    case ACTIVATE_TOPIC:
      return Object.assign({}, state, { currentTopic: action.topic });
    default:
      return state;
  }
}
