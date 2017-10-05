export function initArticleReview() {
  return { type: 'FETCH_ARTICLE_REVIEW' };
}

export function storeArticleReview(normalizedData) {
  return { type: 'FETCH_ARTICLE_REVIEW_SUCCESS',
           normalizedData
  };
}

export function errorArticleReview(error) {
  return { type: 'FETCH_ARTICLE_REVIEW_FAIL',
           error
  };
}
