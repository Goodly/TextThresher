
import { getIntOfLength } from 'utils/math';

function getInitialState() {
  return {
    article: {},
    currentArticle: null,
    nextArticle: null,
    topics: [],
    colors: ['rgb(241, 96, 97)', 'rgb(253, 212, 132)', 'rgb(175, 215, 146)', 'rgb(168, 210, 191)', 'rgb(255,153,000)', 'rgb(102,000,153)', 'rgb(000,153,153)', 'rgb(255,102,255)', 'rgb(000,051,153)', 'rgb(153,000,204)', 'rgb(70,194,64)', 'rgb(94,242,188)'],
    page: `http://192.168.99.100:5000/api/articles/?format=json`
  };
}

const initialState = Object.assign({
  article: {},
  articleIndex: [],
  topics: [],
  highlights: [],
}, getInitialState());


export function article(state = initialState, action) {
  switch (action.type) {
    case 'ACTIVATE_TOPIC':
      return Object.assign({}, state, { currentTopic: action.topic });
    case 'FETCH_ARTICLE':
      return {
        ...state,
        article: {
          isFetching: true
        },
        currentArticle: Number(action.articleId),
        nextArticle: {
          isFetching: true
        },
      }
    case 'FETCH_TOPICS':
      return {
          topics: []
      }
    case 'FETCH_ARTICLE_SUCCESS':
    console.log('Fetch article')
    console.log(action)
      return {
        ...state,
        article: action.curr,
        nextArticle: action.next,
        page: action.newpage
      }
    case 'FETCH_TOPIC_SUCCESS':
      return {
        ...state,
        topics: action.response.results
      }
    case 'FETCH_TOPIC_FAIL':
      return {
        ...state,
      }
    default:
      return state;
  }
}
