export function storeArticle(article) {
  return {
    type: 'FETCH_ARTICLE_SUCCESS',
    response: article
  };
}

export function storeSaveAndNext(saveAndNext) {
  return {
    type: 'POST_HIGHLIGHTS_CALLBACK',
    saveAndNext: saveAndNext
  };
}
