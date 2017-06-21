import { Map as ImmutableMap } from 'immutable';
import { normalize, schema } from 'normalizr';

// Schema for normalizing the task data structure into table like entities using
// the database id as key, e.g.,
// db.entities.topic[id], db.entities.question[id], db.entities.answer[id]
let answerSchema = new schema.Entity('answer');
let questionSchema = new schema.Entity('question', {answers: [answerSchema]});
let topicSchema = new schema.Entity('topic', {questions: [questionSchema]});
let hintSchema = new schema.Entity('hint', {}, {idAttribute: 'hint_type'});
let quizTaskSchema = {
  topictree: [topicSchema],
  hints: [hintSchema],
};

import { kelly_colors } from 'utils/colors';
const COLOR_OPTIONS = kelly_colors;

// module level variable index over COLOR_OPTIONS
var next_color_index = 0;

const initialState = {
  currTask: null,
  db: { entities: {}, result: {} },
  curr_question_id: -1,
  queue: [-1],
  curr_answer_id: -100,
  answer_selected: ImmutableMap(),
  answer_colors: ImmutableMap(),
  saveAndNext: null,
  review: false,
  done: false,
};

// Currently there is always a root topic with one or more sub-topics.
// Also, for now the root topic does not start with any questions.
// If there is more than one sub-topic, generate an initial question
// asking which subtopics are in the text, and add that question to
// the root topic. Our generated initial question is given id -1.
// So our queue starts out with question id -1.
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
  // Iterate over ImmutableMaps to add questions activated by current answers
  // based on current set of answers
  for (let question_id of answer_selected.keys()) {
    let next_questions = lookupQuestionNext[question_id];
    let answerMap = answer_selected.get(question_id);
    for (let answer_id of answerMap.keys()) {
      next_questions = next_questions.concat(lookupAnswerNext[answer_id]);
    };
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
    case 'CLEAR_ANSWERS': { // use block scope for all cases declaring variables
      const answer_selected = ImmutableMap();
      return {
        ...state,
        curr_question_id: -1,
        queue: updateQueue(state.currTask, answer_selected),
        curr_answer_id: -100,
        answer_selected,
        answer_colors: ImmutableMap(),
        review: false
      }
    }
    case 'FETCH_QUESTION':
      return Object.assign({}, initialState, { isFetching: true });
    case 'FETCH_TASK_SUCCESS': {
      addSubtopicQuestion(action.task);
      sortQuestionsByNumber(action.task.topictree)
      const taskDB = normalize(action.task, quizTaskSchema);
      const answer_selected = ImmutableMap();
      return {
        ...state,
        currTask: action.task,
        db: taskDB,
        curr_question_id: -1,
        queue: updateQueue(action.task, answer_selected),
        answer_selected,
        answer_colors: ImmutableMap(),
        review: false,
        done: false
      }
    }
    case 'ANSWER_SELECTED': {
      let answer_selected = state.answer_selected;
      let answer_colors = state.answer_colors;
      const new_ans = {
        answer_id: action.answer_id,
        question_id: action.question_id,
        question_type: action.question_type,
        text: action.text
      };
      if (answer_selected.has(action.question_id) && action.question_type == 'CHECKBOX') {
        const answerMap = answer_selected.get(action.question_id);
        answer_selected = answer_selected.set(action.question_id, answerMap.set(action.answer_id, new_ans));
      } else {
        answer_selected = answer_selected.set(action.question_id, ImmutableMap([[action.answer_id, new_ans]]));
      }
      if (!answer_colors.has(action.answer_id)) {
        const color = COLOR_OPTIONS[next_color_index++ % COLOR_OPTIONS.length];
        answer_colors = answer_colors.set(action.answer_id, color);
      };
      return {
        ...state,
        queue: updateQueue(state.currTask, answer_selected),
        curr_answer_id: action.answer_id,
        answer_selected,
        answer_colors
      }
    }
    case 'ANSWER_REMOVED': {
      let answer_selected = state.answer_selected;
      let answer_colors = state.answer_colors;
      if (answer_selected.has(action.question_id)) {
        const answerMap = answer_selected.get(action.question_id);
        answer_selected = answer_selected.set(action.question_id, answerMap.delete(action.answer_id));
        return {
          ...state,
          queue: updateQueue(state.currTask, answer_selected),
          answer_selected,
          answer_colors
        };
      };
      return state;
    }
    case 'UPDATE_REVIEW':
      return {
        ...state,
        review: action.review
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
