import { displayStates } from 'components/displaystates';

const initialState = {
  articleNormalized: {},
  displayState: displayStates.BEFORE_LOAD,
  lastDisplayState: displayStates.BEFORE_LOAD,
  error: null,
};

export function articleView(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_ARTICLE_REVIEW':
      return Object.assign({}, initialState, {
        displayState: displayStates.BEFORE_LOAD,
      });
    case 'FETCH_ARTICLE_REVIEW_SUCCESS':
      return {
        ...state,
        articleNormalized: action.normalizedData,
        displayState: displayStates.TASK_LOADED,
      }
    case 'FETCH_ARTICLE_REVIEW_FAIL':
      return {
        ...state,
        error: action.error,
      }
    default:
      return state;
  }
}
