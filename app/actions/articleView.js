export function initArticleView() {
  return { type: 'FETCH_ARTICLE_REVIEW' };
}

export function storeArticleView(normalizedData) {
  return { type: 'FETCH_ARTICLE_REVIEW_SUCCESS',
           normalizedData
  };
}

export function showArticleView(article_id) {
  return { type: 'DISPLAY_ARTICLE_VIEW',
           article_id
  };
}

export function errorArticleView(error) {
  return { type: 'FETCH_ARTICLE_REVIEW_FAIL',
           error
  };
}
