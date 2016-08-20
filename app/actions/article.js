export function fetchArticle(articleId) {
  return (dispatch) => {
    dispatch({ type: 'FETCH_ARTICLE', articleId});

    return fetch(`http://192.168.99.100:5000/api/articles/${articleId}/?format=json`) // TODO: resolve this absolute URL issue with backend
      .then(response => response.json())
      .then(
        (response) => dispatch({ type: 'FETCH_ARTICLE_SUCCESS', response}),
        (error) => dispatch({ type: 'FETCH_ARTICLE_FAIL', error})
      );
  };
}

export function fetchTopic(topicId) {
  return (dispatch) => {
    dispatch({ type: 'FETCH_TOPIC'});

    return fetch(`http://192.168.99.100:5000/api/topics/${topicId}/?format=json`) // TODO: resolve this absolute URL issue with backend
      .then(response => response.json())
      .then(
        (response) => dispatch({ type: 'FETCH_TOPIC_SUCCESS', response}),
        (error) => dispatch({ type: 'FETCH_TOPIC_FAIL', error})
      );
  };
}

export function getArticle(articleId) {
  return {
    type: 'GET_ARTICLE',
    articleId
  };
}

/*export function addHighlight(start, end, selectedText) {
  return {
    type: 'ADD_HIGHLIGHT',
    selection: {start, end, selectedText}
  };
}*/

/*export function activateTopic(topicId) {
  return {
    type: 'ACTIVATE_TOPIC',
    topicId
  }
}*/
export function activateTopic(topic) {
  return { type: 'ACTIVATE_TOPIC', topic };
}

/*export function passTopic(topic) {
  return { type: 'PASS_TOPIC_TO_PICKER', topic };
}*/
