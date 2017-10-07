import React from 'react';
import { render } from 'react-dom';
import { bindActionCreators } from 'redux';

import App, { store } from 'containers/App';
import * as articleReviewActions from 'actions/articleReview';
import fetchArticleReview from 'django/articleReview';

let reduxActions = bindActionCreators(articleReviewActions, store.dispatch);

render(
  <App>
    <div>Still working on this.</div>
  </App>,
  document.getElementById('react-root')
);

export function loadArticle(articleFetchURL) {
  console.log(`Fetching: ${articleFetchURL}`);
  fetchArticleReview(reduxActions, articleFetchURL);
};
