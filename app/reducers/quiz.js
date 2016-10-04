const initialState = Object.assign({
  question: {
    text: "Foo"
  },
}, {});

export function quiz(state = initialState, action) {
  console.log(action);
  switch(action.type) {
    case 'FETCH_QUESTION':
    return {
      ...state,
      question: {
        isFetching: true
      }
    }
    case 'FETCH_QUESTION_SUCCESS':
      return {
        ...state,
        question: action.response
    }
    default:
      return state;
  }
}
