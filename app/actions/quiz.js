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

export function storeSaveAndNext(saveAndNext) {
  return {
    type: 'POST_QUIZ_CALLBACK',
    saveAndNext: saveAndNext
  };
}
