const initialState = Object.assign({
  question: {
    isFetching: true
  },
  answer_selected: {},
  highlighter_color: {},
  saveAndNext: null
}, {});

export function quiz(state = initialState, action) {
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
      var temp = Object.assign({}, state.answer_selected);
      var new_ans = {
        answer_id: action.answer_id,
        question_id: action.question_id,
        question_type: action.question_type,
        text: action.text,
      };
      console.log(new_ans);
      if(temp[action.question_id] && action.question_type == 'CHECKBOX') {
          temp[action.question_id].push(new_ans);
      } else{
        temp[action.question_id] = [new_ans];
      }
      return {
          ...state,
          answer_selected: temp
      }
    case 'ANSWER_REMOVED':
      var ans_array = state.answer_selected[action.question_id];
      var ind = -1;
      for(var i = 0; i < ans_array.length; i++) {
        if(ans_array[i].answer_id == action.answer_id) {
          ind = i;
          break;
        }
      }
      if(i > -1) {
        var temp = Object.assign({}, state.answer_selected);
        temp[action.question_id].splice(ind, 1);
        return {
          ...state,
          answer_selected: temp
        };
      }
      return state;
    case 'COLOR_SELECTED':
      var assign_dict = { question_id: action.question_id, answer_id: action.answer_id, color: action.color };
      return {
        ...state,
        highlighter_color: assign_dict
      }
    case 'POST_QUIZ_CALLBACK':
      return {
        ...state,
        saveAndNext: action.saveAndNext
      }
    default:
      return state;
  }
}
