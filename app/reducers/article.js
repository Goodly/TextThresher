const initialState = {
    article: {
      text: ""
    },
    saveAndNext: null
};

export function article(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_ARTICLE_SUCCESS':
      return {
        ...state,
        article: action.response
      }
    case 'POST_HIGHLIGHTS_CALLBACK':
      return {
        ...state,
        saveAndNext: action.saveAndNext
      }
    default:
      return state;
  }
}
