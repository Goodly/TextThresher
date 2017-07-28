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
  };
}

export function selectAnswer(question_type, question_id, answer_id, text) {
  return {
    type: 'ANSWER_SELECTED',
    question_type,
    question_id,
    answer_id,
    text
  };
}

export function removeAnswer(question_type, question_id, answer_id) {
  return {
    type: 'ANSWER_REMOVED',
    question_type,
    question_id,
    answer_id
  }
}
