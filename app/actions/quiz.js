export function storeQuizTask(task) {
  return {
    type: 'FETCH_TASK_SUCCESS',
    task,
  };
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

export function colorSelected(question_id, answer_id, color) {
  return {
    type: 'COLOR_SELECTED',
    question_id,
    answer_id,
    color
  };
}

export function storeSaveAndNext(saveAndNext) {
  return {
    type: 'POST_QUIZ_CALLBACK',
    saveAndNext: saveAndNext
  };
}
