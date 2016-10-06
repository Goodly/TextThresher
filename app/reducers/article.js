import { getIntOfLength } from 'utils/math';

// #TODO: create endpoint to return these indices on the back-end
const ARTICLE_INDEX_ARRAY = [0, 9, 11, 38, 53, 55, 202, 209, 236, 259];

function getNextArticle(articleId) {
  ARTICLE_INDEX_ARRAY.splice(ARTICLE_INDEX_ARRAY.indexOf(articleId), 1);
  return ARTICLE_INDEX_ARRAY[getIntOfLength(ARTICLE_INDEX_ARRAY)];
}

function getInitialState() {
  return {
    article: {},
    currentArticle: null,
    nextArticle: null
  };
}

const initialState = Object.assign({
  article: {},
  articleIndex: [],
}, getInitialState());


export function article(state = initialState, action) {
  switch (action.type) {
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
    case 'POST_HIGHLIGHTS':
      return state
    default:
      return state;
  }
}
