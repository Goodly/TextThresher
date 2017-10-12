import React from 'react';
import { render } from 'react-dom';
import { bindActionCreators } from 'redux';

let debug = require('debug')('thresher:articleView');

import App, { store } from 'containers/App';
import { ArticleView } from 'containers/ArticleView';
import * as articleViewActions from 'actions/articleView';
import fetchArticleView from 'django/articleView';

let reduxActions = bindActionCreators(articleViewActions, store.dispatch);

try {
  render(
    <App>
      <ArticleView>
        <div>Loading...</div>
      </ArticleView>
    </App>,
    document.getElementById('react-root')
  );
} catch (error) {
  reduxActions.errorArticleView(error);
};

// This function is called with the URL of the API endpoint
// by the Django page hosting this script.
export function loadArticle(articleFetchURL) {
  debug(`Fetching: ${articleFetchURL}`);
  fetchArticleView(reduxActions, articleFetchURL);
};
