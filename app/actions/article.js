export function fetchArticle(articleId) {
  return (dispatch) => {
    dispatch({ type: 'FETCH_ARTICLE', articleId});
    let host = "http://localhost:5000";
    return fetch(host + `/api/articles/${articleId}/?format=json`)
      .then(response => response.json())
      .then(
        (response) => dispatch({ type: 'FETCH_ARTICLE_SUCCESS', response}),
        (error) => dispatch({ type: 'FETCH_ARTICLE_FAIL', error})
      );
  };
}

export function postArticleHighlights(highlightsString, articleId) {
  return (dispatch) => {
    dispatch({ type: 'POST_HIGHLIGHTS'});

    return fetch(`http://localhost:5000/api/postHighlights/${articleId}`, {
        method: 'POST',
        body: highlightsString
      })
      .then(response => response.json())
      .then(
        (response) => dispatch({ type: 'POST_HIGHLIGHTS_SUCCESS'}, response),
        (error) => dispatch({ type: 'POST_HIGHLIGHTS_FAIL', error})
      );
  };
}
