export function storeArticle(article) {
  return {
    type: 'FETCH_ARTICLE_SUCCESS',
    response: article
  };
}
