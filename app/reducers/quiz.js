const initialState = Object.assign({
  question: {
    isFetching: true
  },
  answer_selected: {
    id: 0,
    checked: {},
    text: ''
  },
  highlighter_color: null
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
    case 'ANSWER_SELECTED':
      return {
          ...state,
          answer_selected: {
            id: action.id,
            checked: action.checked,
            text: action.text
          } 
      }
    case 'COLOR_SELECTED':
      return {
        ...state,
        highlighter_color: action.color
      }
    default:
      return state;
  }
}
