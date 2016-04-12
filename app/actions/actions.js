import * as types from './actionTypes';

export function addHighlight(start, end, selectedText) {
  return { type: types.ADD_HIGHLIGHT, selection: {start, end, selectedText} };
}

export function activateTopic(topic) {
  return { type: types.ACTIVATE_TOPIC, topic };
}

export function newArticle(article) {
  return { type: types.NEW_ARTICLE, article };
}

export function newQuestions(questions) {
  return { type: types.NEW_QUESTIONS, questions };
}
