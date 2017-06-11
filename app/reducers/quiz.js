const initialState = {
  currTask: null,
  queue: [-1],
  review: false,
  curr_question_id: -1,
  answer_selected: {},
  highlighter_color: {},
  saveAndNext: null,
  done: false,
};

// Currently there is always a root topic with one or more sub-topics.
// Also, for now the root topic does not start with any questions.
// If there is more than one sub-topic, generate an initial question
// asking which subtopics are in the text, and add that question to
// the root topic.
// Note we have to generate ids < 0 to avoid colliding with database ids.
function addSubtopicQuestion(task) {
  let topictree = task.topictree;
  let answer_list = [];
  let topTopic = null;
  const { noncontingent } = questionSets(topictree);
  // questions are sorted by id, so number subtopics like -6, -5, ..., -2
  const start_id = -topictree.length - 2;
  topictree.forEach( (topic, i) => {
    if(topic.id !== task.topTopicId) {
      let next_questions = topic.questions.map( (question) => question.id );
      next_questions = next_questions.filter( (q_id) => noncontingent.has(q_id) );
      answer_list.push({
        id: start_id + i,
        answer_number: i + 1,
        answer_content: topic.name,
        next_questions: next_questions
      });
    } else {
      topTopic = topic;
    };
  });
  let sub_question = {
    id: -1,
    question_number: 0,
    question_type: 'SELECT_SUBTOPIC',
    question_text: 'Which of these subtopics are in the highlighted text?',
    answers: answer_list,
    next_questions: []
  };
  topTopic.questions.unshift(sub_question);
};

// Compute three sets:
// The set of all question IDs
// the set of all questions mentioned in 'next_questions' fields
// and the set difference:
// noncontingent = allQuestions - contingent
// Also, create a map from question.id to next_questions that
// doesn't require iterating over topictree.
// Also, create a map from answer.id to next_questions for same reason.
function questionSets(topictree) {
  let contingent = new Set();
  let allQuestions = [];
  let lookupQuestionNext = {};
  let lookupAnswerNext = {};
  for (let t = 0; t < topictree.length; t++) {
    let questions = topictree[t].questions;
    for(let i = 0; i < questions.length; i++) {
      allQuestions.push(questions[i].id);
      let next_questions = questions[i].next_questions;
      lookupQuestionNext[questions[i].id] = next_questions;
      for(let k = 0; k < next_questions.length; k++) {
        contingent.add(next_questions[k]);
      }
      // add in next_question from Answers
      let answers = questions[i].answers;
      for(let k = 0; k < answers.length; k++) {
        let next_questions = answers[k].next_questions;
        lookupAnswerNext[answers[k].id] = next_questions;
        for(let j = 0; j < next_questions.length; j++) {
          contingent.add(next_questions[j]);
        }
      }
    }
  }
  // Now calculate the set difference (allQuestions - contingent)
  let noncontingent = allQuestions.filter(
    (id) => ! contingent.has(id)
  );
  return {
    contingent,
    noncontingent: new Set(noncontingent),
    allQuestions: new Set(allQuestions),
    lookupQuestionNext,
    lookupAnswerNext
  };
};

function updateQueue(currTask, answer_selected) {
  const { noncontingent, lookupQuestionNext, lookupAnswerNext } =
    questionSets(currTask.topictree);
  let activeQuestions = new Set(noncontingent);
  // Iterate over object to add questions activated by current answers
  // based on current set of answers
  for (let question_id in answer_selected) {
    let next_questions = lookupQuestionNext[question_id];
    let answerList = answer_selected[question_id];
    answerList.forEach( (answer) => {
      next_questions = next_questions.concat(lookupAnswerNext[answer.answer_id]);
    });
    next_questions.forEach( (question_id) => activeQuestions.add(question_id) );
  };
  let queue = Array.from(activeQuestions);
  return queue.sort((a, b) => { return a - b; });
}

function sortQuestionsByNumber(topictree) {
  for(let i = 0; i < topictree.length; i++) {
    topictree[i].questions = topictree[i].questions.sort(
      (a, b) => a.question_number - b.question_number
    );
  }
}

export function quiz(state = initialState, action) {
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
      addSubtopicQuestion(action.task);
      sortQuestionsByNumber(action.task.topictree)
      return {
        ...state,
        currTask: action.task,
        queue: updateQueue(action.task, state.answer_selected),
        done: false
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
          queue: updateQueue(state.currTask, temp),
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
          queue: updateQueue(state.currTask, temp),
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
    case 'RESET_QUEUE':
      return {
        ...state,
        queue: [-1]
      }
    case 'TASK_DONE':
      return {
        ...state,
        done: true
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
