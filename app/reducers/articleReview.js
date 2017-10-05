const initialState = {
  articleNormalized: {}
};

export function articleReview(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_ARTICLE_REVIEW':
      return Object.assign({}, initialState, { isFetching: true });
    case 'FETCH_ARTICLE_REVIEW_SUCCESS':
      return {
        ...state,
        articleNormalized: action.normalizedData,
        isFetching: false
      }
    case 'FETCH_ARTICLE_REVIEW_FAIL':
      // TODO: Put a helpful error message in the UI.
      throw action.error;
    default:
      return state;
  }
}
