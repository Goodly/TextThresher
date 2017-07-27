const initialState = {
    article: {
      text: ""
    },
};

export function article(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_ARTICLE_SUCCESS':
      return {
        ...state,
        article: action.response
      }
    default:
      return state;
  }
}
