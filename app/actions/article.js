export function fetchArticle(articleId) {
  return (dispatch) => {
    dispatch({ type: 'FETCH_ARTICLE', articleId});
    console.log('FETCH ARTICLE')

    return fetch(`http://192.168.99.100:5000/api/articles/?format=json`)
      .then(response => response.json())
      .then(
        (response) => {
          var fetch_next = false;
          for (var entry in response.results) {
            var article = response.results[entry];
            console.log(fetch_next)


            if (article.article_id == articleId) {
               fetch_next = true;
               var curr = article;
            } else if (fetch_next) {
              var next = article.article_id;
              console.log(next);
              break;
            }
          }
          dispatch({type: 'FETCH_ARTICLE_SUCCESS', curr, next})},
          (error) => dispatch({ type: 'FETCH_ARTICLE_FAIL', error})
        );



    /*return fetch(`http://192.168.99.100:5000/api/articles/${articleId}/?format=json`) // TODO: resolve this absolute URL issue with backend
      .then(response => response.json())
      .then(
        (response) => dispatch({ type: 'FETCH_ARTICLE_SUCCESS', response}),
        (error) => dispatch({ type: 'FETCH_ARTICLE_FAIL', error})
      );*/
  };
}

export function fetchTopic() {
  return (dispatch) => {
    dispatch({ type: 'FETCH_TOPIC'});

    //return fetch(`http://192.168.99.100:5000/api/topics/${topicId}/?format=json`) // TODO: resolve this absolute URL issue with backend
    return fetch(`http://192.168.99.100:5000/api/topics/`)
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

export function activateTopic(topic) {
  return { type: 'ACTIVATE_TOPIC', topic };
}

/*export function passTopic(topic) {
  return { type: 'PASS_TOPIC_TO_PICKER', topic };
}*/
