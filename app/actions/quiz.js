export function fetchQuestion(qId) {
  return (dispatch) => {
    dispatch({ type: 'FETCH_QUESTION', qId});
    let host = "http://localhost:5000";
    return fetch(host + `/api/question/${qId}`)
      .then(response => response.json())
      .then(
        (response) => dispatch({ type: 'FETCH_QUESTION_SUCCESS', response}),
        (error) => dispatch({ type: 'FETCH_QUESTION_ERROR', error})
      );
  };
}

export function answerSelected(id, text, checked) {
  return {
    type: 'ANSWER_SELECTED',
    id,
    text,
    checked
  };
}

export function colorSelected(color) {
  return {
    type: 'COLOR_SELECTED',
    color: color
  };
}
