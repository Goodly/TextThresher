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
    topics: topicJsonMock.results,
    colors: ['rgb(241, 96, 97)', 'rgb(253, 212, 132)', 'rgb(175, 215, 146)', 'rgb(168, 210, 191)', 'rgb(255,153,000)', 'rgb(102,000,153)', 'rgb(000,153,153)', 'rgb(255,102,255)', 'rgb(000,051,153)', 'rgb(153,000,204)', 'rgb(70,194,64)', 'rgb(94,242,188)']
  };
}

const initialState = Object.assign({
  article: {},
  articleIndex: [],
  topics: [],
  highlights: [],
  //colors: ['rgb(241, 96, 97)', 'rgb(253, 212, 132)', 'rgb(175, 215, 146)', 'rgb(168, 210, 191)', 'rgb(255,153,000)', 'rgb(102,000,153)', 'rgb(000,153,153)', 'rgb(255,102,255)', 'rgb(000,051,153)', 'rgb(153,000,204)', 'rgb(70,194,64)', 'rgb(94,242,188)']

}, getInitialState());


export function article(state = initialState, action) {
  switch (action.type) {
    case 'ACTIVATE_TOPIC':
      console.log('ACTIVATE TOPIC')
      console.log(action)
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
