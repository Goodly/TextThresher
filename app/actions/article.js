export function fetchArticle(articleId) {
  return (dispatch) => {
    dispatch({ type: 'FETCH_ARTICLE', articleId});

    return fetch(`http://localhost:5000/api/articles/${articleId}/?format=json`) // TODO: resolve this absolute URL issue with backend
      .then(response => response.json())
      .then(
        (response) => dispatch({ type: 'FETCH_ARTICLE_SUCCESS', response}),
        (error) => dispatch({ type: 'FETCH_ARTICLE_FAIL', error})
      );
  };
}
