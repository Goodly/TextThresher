import { contextWords, getQuestionHints } from 'components/Quiz/contextWords';
import { EXTRA_WORDS, SPECIAL_DISP_ID } from 'components/Quiz/contextWords';
import { addHighlight } from 'actions/highlight';

export function clearAnswers() {
  return {
    type: 'CLEAR_ANSWERS',
  };
}

export function activeQuestion(q_id) {
  return {
    type: 'UPDATE_ACTIVE_QUESTION',
    q_id
  };
  // Stuff the NLP hints into the highlighter for display.
  var hints = task.hints;
}

export function setReview(review) {
  return {
    type: 'UPDATE_REVIEW',
    review
  };
}

export function storeQuizTask(task) {
  return (dispatch, getState) => {
    dispatch({
      type: 'FETCH_TASK_SUCCESS',
      task,
    });
    // Show original highlights in gray.
    // A truly horrible hacky hack because new offsets have to be derived for
    // shortened text.
    var offsets = task.highlights[0].offsets;
    var article = task.article.text;
    var text = '';
    offsets.forEach( (offset) => {
      var triplet = contextWords(article, offset, EXTRA_WORDS);
      var fromIndex = text.length;
      text += '...' + triplet.join(' ') + '...';
      var start = text.indexOf(offset[2], fromIndex);
      if (start != -1) {
        var end = start + offset[2].length;
        dispatch(addHighlight(start, end, offset[2], SPECIAL_DISP_ID, ""));
      };
    });
  };
}

export function storeTasksDone() {
  return {
    type: 'TASK_DONE',
  }
}

export function answerSelected(question_type, question_id, answer_id, text) {
  return {
    type: 'ANSWER_SELECTED',
    question_type,
    question_id,
    answer_id,
    text
  };
}

export function answerRemoved(question_type, question_id, answer_id) {
  return {
    type: 'ANSWER_REMOVED',
    question_type,
    question_id,
    answer_id
  }
}

export function colorSelected(question_id=0, answer_id=0, color='', color_id=-1) {
  return {
    type: 'COLOR_SELECTED',
    question_id,
    answer_id,
    color,
    color_id
  };
}

export function resetQueue() {
  return {
    type: 'RESET_QUEUE',
  };
}

export function storeSaveAndNext(saveAndNext) {
  return {
    type: 'POST_QUIZ_CALLBACK',
    saveAndNext: saveAndNext
  };
}

export function updateQueue(questions, question_type) {
  return {
    type: 'UPDATE_QUEUE',
    questions,
    question_type
  };
}

export function removeElemQueue(questions) {
  return {
    type: 'REMOVE_QUEUE',
    questions
  };
}
