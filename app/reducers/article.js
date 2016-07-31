import topicJsonMock from '../assets/topic_0_mock.json';
import { getIntOfLength } from 'utils/math';

const ARTICLE_INDEX_ARRAY = [0, 9, 11, 38, 53, 55, 202, 209, 236, 259];

function getNextArticle(articleId) {
  ARTICLE_INDEX_ARRAY.splice(ARTICLE_INDEX_ARRAY.indexOf(articleId), 1);
  return ARTICLE_INDEX_ARRAY[getIntOfLength(ARTICLE_INDEX_ARRAY)];
}

function getInitialState() {
  return {
    article: {},
    currentArticle: null,
    nextArticle: null,
    topics: topicJsonMock.results
  };
}

const initialState = Object.assign({
  article: {},
  articleIndex: [],
  topics: [],
  highlights: []
}, getInitialState());


export function article(state = initialState, action) {
  console.log(action);
  switch (action.type) {
    case 'ADD_HIGHLIGHT':
      console.log('ADD_HIGHLIGHT :: ACTION_PLAYING!');
    case 'ACTIVATE_TOPIC':
      return Object.assign({}, state, { currentTopic: action.topic });
    case 'FETCH_ARTICLE':
      let nextArticleIndex = getNextArticle(Number(action.articleId));
      return {
        ...state,
        article: {
          isFetching: true
        },
        currentArticle: Number(action.articleId),
        nextArticle: nextArticleIndex
      }
    case 'FETCH_ARTICLE_SUCCESS':
      return {
        ...state,
        article: action.response
      }
    default:
      return state;
  }
}
