import React from 'react';
import { render } from 'react-dom';
import App, { store } from 'containers/App';

render(
  <App>
    <div>Still working on this.</div>
  </App>,
  document.getElementById('react-root')
);

export function loadArticle(article) {
  console.log(article['id']);
};
