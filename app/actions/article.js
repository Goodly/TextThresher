export const ADD_HIGHLIGHT = 'ADD_HIGHLIGHT';
export const ACTIVATE_TOPIC = 'ACTIVATE_TOPIC';
export const NEW_QUESTIONS = 'NEW_QUESTIONS';
export const NEW_ARTICLE = 'NEW_ARTICLE';

export function fetchArticle(articleId) {
  return (dispatch) => {
    dispatch({ type: 'FETCH_ARTICLE'});

    return fetch(`http://localhost:5000/api/articles/${articleId}/?format=json`) // TODO: resolve this absolute URL issue with backend
      .then(response => response.json())
      .then(
        (response) => dispatch({ type: 'FETCH_SUCCESS', response}),
        (error) => dispatch({ type: 'FETCH_FAIL', error})
      );
  };
}

export function fetchTopic(topicId) {
  return (dispatch) => {
    dispatch({ type: 'FETCH_TOPIC'});

    return fetch(`http://localhost:5000/api/topics/${topicId}/?format=json`) // TODO: resolve this absolute URL issue with backend
      .then(response => response.json())
      .then(
        (response) => dispatch({ type: 'FETCH_SUCCESS', response}),
        (error) => dispatch({ type: 'FETCH_FAIL', error})
      );
  };
}

export function getArticle(articleId) {
  return {
    type: 'GET_ARTICLE',
    articleId
  };
}

export function addHighlight(start, end, selectedText) {
  return { type: ADD_HIGHLIGHT, selection: {start, end, selectedText} };
}
