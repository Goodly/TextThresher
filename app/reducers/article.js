import topicJsonMock from '../assets/topic_0_mock.json';

function getInitialState() {
  return {
    article: {
      isFetching: true
    },
    topics: topicJsonMock.results
  };
}

const initialState = Object.assign({
  article: {},
  topics: [],
  highlights: [],
  curArticle: null,
}, getInitialState());

function mergeHighlights(list) {

}

export function article(state = initialState, action) {
  console.log(action);
  switch (action.type) {
    case 'ADD_HIGHLIGHT':
      console.log('ADD_HIGHLIGHT :: ACTION_PLAYING!');
    case 'ACTIVATE_TOPIC':
      return Object.assign({}, state, { currentTopic: action.topic });
    case 'GET_ARTICLE':
      return {
        ...state,
        curArticle: Number(action.articleId)
      }
    case 'FETCH_SUCCESS':
      return {
        ...state,
        article: action.response
      }
    default:
      return state;
  }
}
