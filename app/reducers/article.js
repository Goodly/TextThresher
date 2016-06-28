// import api from '../api.js';

import articleJsonMock_0 from '../assets/article_0_mock.json';
import articleJsonMock_9 from '../assets/article_9_mock.json';

import topicJsonMock from '../assets/topic_0_mock.json';

// NOTE: create mock article routes at `/topics/0` and `/topics/9`
var articleMock = new Array(9)
articleMock[0] = articleJsonMock_0
articleMock[9] = articleJsonMock_9

function getInitialState() {
  return {
    articles: articleMock,
    topics: topicJsonMock.results
  };
}

const initialState = Object.assign({
  article: [],
  topics: [],
  highlights: [],
  curArticle: null
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

export function article(state = initialState, action) {
  console.log(action);
  switch (action.type) {
    case 'ADD_HIGHLIGHT':
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
    // case NEW_ARTICLE:
    //   api.sendHighlights(state.highlights);
    //   if (!action.article || action.article >= state.articles.length) {
    //     return Object.assign({}, state, { articles: api.getArticles(),
    //                                       highlights: [],
    //                                       curArticle: 0 });
    //   }
    //   return Object.assign({}, state, { highlights: [],
    //                                     curArticle: state.curArticle + 1 });
    case 'ACTIVATE_TOPIC':
      return Object.assign({}, state, { currentTopic: action.topic });
    case 'GET_ARTICLE':
      return {
        ...state,
        curArticle: Number(action.articleId)
      }
    default:
      return state;
  }
}
