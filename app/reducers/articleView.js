import { displayStates } from 'components/displaystates';

const initialState = {
  database: {},
  article_id: null,
  article_ids: [],
  page: {count: 0, previous: null, next: null, results: []},
  displayState: displayStates.BEFORE_LOAD,
  lastDisplayState: displayStates.BEFORE_LOAD,
  error: null,
};

export function articleView(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_ARTICLE_REVIEW':
      return Object.assign({}, initialState, {
        ...state,
        displayState: displayStates.BEFORE_LOAD,
      });
    case 'FETCH_ARTICLE_REVIEW_SUCCESS':
      let database = action.normalizedData;
      let page = database.result;
      let article_ids = database.result.results;
      let article_id = article_ids[0];
      return {
        ...state,
        database,
        page,
        article_id,
        article_ids,
        displayState: displayStates.TASK_LOADED,
      }
    case 'DISPLAY_ARTICLE_VIEW':
      return {
        ...state,
        article_id,
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
