import React from 'react';
import { render } from 'react-dom';
import { Router, Route, hashHistory } from 'react-router';

import App from 'containers/App';
import { TopicHighlighter } from 'containers/TopicHighlighter';

let elem = document.createElement('div');
elem.id = ('react-root');
document.body.appendChild(elem);

let Routes =
  <Route path='/' component={App}>
    <Route path='article/:articleId' component={TopicHighlighter} />
  </Route>;

render(
  <Router
    history={ hashHistory }
    routes={ Routes } />,
  document.getElementById('react-root')
);
