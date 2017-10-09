import React from 'react';
import { render } from 'react-dom';
import { bindActionCreators } from 'redux';

import App, { store } from 'containers/App';
import * as articleViewActions from 'actions/articleView';
import fetchArticleView from 'django/articleView';

let reduxActions = bindActionCreators(articleViewActions, store.dispatch);

render(
  <App>
    <div>Still working on this.</div>
  </App>,
  document.getElementById('react-root')
);

export function loadArticle(articleFetchURL) {
  console.log(`Fetching: ${articleFetchURL}`);
  fetchArticleView(reduxActions, articleFetchURL);
};
