import { Map as ImmutableMap } from 'immutable';
import { normalize, schema } from 'normalizr';
import moment from 'moment';

import { abridgeText } from 'components/Quiz/contextWords';

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
// module level variable used as an index over COLOR_OPTIONS
var next_color_index = 0;

import { selectAnswer } from 'actions/quiz';

const initialState = {
  currTask: null,
  db: { entities: {}, result: {} },
  abridged: '',
  abridged_highlights: [],
  curr_question_id: -1,
  queue: [-1],
  curr_answer_id: -100,
  answer_selected: ImmutableMap(),
  answer_colors: ImmutableMap(),
  review: false,
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
    question_text: 'Which of these subtopics are in the bold-faced text?',
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

function updateAnswerColors(state, submittedAnswer, remove=false) {
  let answer_colors = state.answer_colors;
  const question_id = submittedAnswer.question_id;
  const answer_id = submittedAnswer.answer_id;
  // If a color was assigned to a previously selected button in this
  // radio group, then retrieve the color and re-use it. Remove
  // the prior radio answer from the color map, so the highlighter
  // can detect that we want to discard the prior highlight.
  if (state.answer_selected.has(question_id) &&
      submittedAnswer.question_type === "RADIO") {
    const lastAnswerMap = state.answer_selected.get(question_id);
    const lastRadioId = lastAnswerMap.entries().next().value[0];
    const lastRadioColor = answer_colors.get(lastRadioId);
    answer_colors = answer_colors.delete(lastRadioId);
    return answer_colors.set(answer_id, lastRadioColor);
  };
  if ( ! answer_colors.has(answer_id) && remove === false) {
    // If this answer has no color yet and we are not removing, assign a color
    const color = COLOR_OPTIONS[next_color_index++ % COLOR_OPTIONS.length];
    answer_colors = answer_colors.set(answer_id, color);
  } else if (remove === true) {
    // answer is in set and we are being asked to remove color
    answer_colors = answer_colors.delete(answer_id);
  };
  return answer_colors;
}

function getAnswerValue(answer_selected, answer_id, default_value) {
  for (const answered_qs of answer_selected.values()) {
    if (answered_qs.has(answer_id)) {
      return answered_qs.get(answer_id).text;
    };
  };
  return default_value;
}

function getDefaultDate(state) {
  if (state.currTask.article &&
      state.currTask.article.metadata &&
      state.currTask.article.metadata['date_published']) {
    return moment(state.currTask.article.metadata['date_published']);
  } else {
    return moment().startOf('date').toISOString();
  };
};

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
    case 'FETCH_TASK_SUCCESS': {
      addSubtopicQuestion(action.task);
      sortQuestionsByNumber(action.task.topictree)
      const taskDB = normalize(action.task, quizTaskSchema);
      const answer_selected = ImmutableMap();
      next_color_index = 0; // Reset color pool
      const currTask = action.task;
      const topic_highlights = currTask.highlights[0].offsets;
      const article_text = currTask.article.text;
      const { abridged, abridged_highlights } = abridgeText(
        article_text,
        topic_highlights,
        []
      );
      return {
        ...state,
        currTask: action.task,
        db: taskDB,
        abridged,
        abridged_highlights,
        curr_question_id: -1,
        queue: updateQueue(action.task, answer_selected),
        curr_answer_id: -100,
        answer_selected,
        answer_colors: ImmutableMap(),
        review: false,
      }
    }
    case 'ANSWER_SELECTED': {
      let answer_selected = state.answer_selected;
      const question_id = action.question_id;
      const answer_id = action.answer_id;
      const submittedAnswer = {
        answer_id,
        question_id,
        question_type: action.question_type,
        text: action.text
      };
      if (answer_selected.has(question_id) && action.question_type == 'CHECKBOX') {
        // Only checkboxes can have more than one answer to a question.
        const answerMap = answer_selected.get(question_id);
        answer_selected = answer_selected.set(question_id, answerMap.set(answer_id, submittedAnswer));
      } else {
        // Otherwise new answer replaces any prior answer for the same question.
        answer_selected = answer_selected.set(question_id, ImmutableMap([[answer_id, submittedAnswer]]));
      }
      return {
        ...state,
        queue: updateQueue(state.currTask, answer_selected),
        curr_answer_id: answer_id,
        answer_selected,
        answer_colors: updateAnswerColors(state, submittedAnswer)
      }
    }
    case 'ANSWER_REMOVED': {
      let answer_selected = state.answer_selected;
      let answer_colors = state.answer_colors;
      if (answer_selected.has(action.question_id)) {
        const answerMap = answer_selected.get(action.question_id);
        if (answerMap.has(action.answer_id)) {
          const submittedAnswer = answerMap.get(action.answer_id);
          answer_selected = answer_selected.set(action.question_id, answerMap.delete(action.answer_id));
          return {
            ...state,
            queue: updateQueue(state.currTask, answer_selected),
            answer_selected,
            answer_colors: updateAnswerColors(state, submittedAnswer, true)
          };
        };
      };
      return state;
    }
    case 'UPDATE_REVIEW':
      return {
        ...state,
        review: action.review
      }
    case 'UPDATE_ACTIVE_QUESTION': {
      // If the question is a single answer question like text or date,
      // then set the placeholder answer immediately to select a color.
      // This is a good place to set the default date to the article
      // metadata 'date_published'
      // This also reselects an available answer for checkbox and radio types.
      let curr_answer_id = -100;
      state = Object.assign({}, state, {
        curr_question_id: action.q_id,
        curr_answer_id
      });
      const question = state.db.entities.question[action.q_id];
      const type = question.question_type;
      if (type === "TEXT" || type === "DATE" || type === "TIME") {
        const answer_id = question.answers[0];
        curr_answer_id = answer_id;
        let answer_text = getAnswerValue(state.answer_selected, answer_id, '');
        if (type === "DATE") {
          const defaultDate = getDefaultDate(state);
          answer_text = getAnswerValue(state.answer_selected, answer_id, defaultDate);
        };
        const selectAnswerAction = selectAnswer(type, action.q_id, answer_id, answer_text);
        // Note sneaky call to this reducer to update state
        state = quiz(state, selectAnswerAction);
      } else if (type === "RADIO" || type === "CHECKBOX") {
        // For radio and checkbox, set curr_answer_id to last selected answer (if any)
        if (state.answer_selected.has(action.q_id)) {
          const answer = state.answer_selected.get(action.q_id);
          if (answer.size > 0) {
            curr_answer_id = answer.last().answer_id;
          };
        };
      };
      return {
        ...state,
        curr_answer_id
      };
    }
    default:
      return state;
  }
}
