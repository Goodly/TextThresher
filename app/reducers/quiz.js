const initialState = {
  currTask: null,
  queue: [-1],
  review: false,
  curr_question_id: -1,
  answer_selected: {},
  highlighter_color: {},
  saveAndNext: null
};

// helper function to initialize queue
function addNonContingentQuestions(questions) {

  var contained = new Set();
  for(var i = 0; i < questions.length; i++) {
    for(var k = 0; k < questions[i].answers.length; k++) {
      for(var j = 0; j < questions[i].answers[k].next_questions.length; j++) {
        contained.add(questions[i].answers[k].next_questions[j]);
      }
    }
  }

  var to_return = [];
  for(var i = 0; i < questions.length; i++) {
    if(!contained.has(questions[i].id)) {
      to_return.push(questions[i].id);
    }
  }
  return to_return.sort((a, b) => { return a - b; });
}

function initQueue(currTask) {
  var topictree = currTask.topictree;
  var topic = {};
  for(var i = 0; i < topictree.length; i++) {
    if(topictree[i].id == currTask.topTopicId) {
      topic = topictree[i];
      break;
    }
  }
  var to_return = [-1];
  to_return = to_return.concat(addNonContingentQuestions(topic.questions));
  return to_return;
}

export function quiz(state = initialState, action) {
  console.log(action);
  console.log(state.queue);
  switch(action.type) {
    case 'CLEAR_ANSWERS':
      return {
        ...state,
        answer_selected: {},
        curr_question_id: -1,
        highlighter_color: {},
        queue: []
      }
    case 'FETCH_QUESTION':
      return Object.assign({}, initialState, { isFetching: true });
    case 'FETCH_TASK_SUCCESS':
      for(var i = 0; i < action.task.topictree.length; i++) {
        action.task.topictree[i].questions = action.task.topictree[i].questions.sort((a, b) => a.question_number - b.question_number);
      }
      return {
        ...state,
        currTask: action.task,
        questions: initQueue(action.task)
      }
    case 'ANSWER_SELECTED':
      var temp = Object.assign({}, state.answer_selected);
      var new_ans = {
        answer_id: action.answer_id,
        question_id: action.question_id,
        question_type: action.question_type,
        text: action.text,
      };
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
    case 'UPDATE_REVIEW':
      return {
        ...state,
        review: action.review
      }
    case 'COLOR_SELECTED':
      return {
        ...state,
        highlighter_color: {
          question_id: action.question_id,
          answer_id: action.answer_id,
          color: action.color,
          color_id: action.color_id
        }
      }
    case 'UPDATE_QUEUE':
      var questions = action.questions;
      if(action.question_type == 'SELECT_SUBTOPIC') {
        questions = addNonContingentQuestions(questions);
      }
      var new_queue = state.queue.slice();
      var ind = new_queue.indexOf(state.curr_question_id);
      for(var i = 0; i < questions.length; i++) {
        if(state.queue.indexOf(questions[i]) == -1) {
          new_queue.splice(ind + i + 1, 0, questions[i]);
        }
      };
      return {
        ...state,
        queue: new_queue
      }
    case 'REMOVE_QUEUE':
      var new_queue = state.queue.slice();
      for(var i = 0; i < action.questions.length; i++) {
        var ind = new_queue.indexOf(action.questions[i].id);
        if(ind != -1) {
          new_queue.splice(ind, 1);
        }
      }
      return {
        ...state,
        queue: new_queue
      }
    case 'RESET_QUEUE':
      return {
        ...state,
        queue: [-1]
      }
    case 'UPDATE_ACTIVE_QUESTION':
      return {
        ...state,
        curr_question_id: action.q_id
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
