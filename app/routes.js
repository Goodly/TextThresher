import React from 'react';
import {Route} from 'react-router';

import App from 'containers/App';
import { TopicHighlighter } from 'containers/TopicHighlighter';

import Quiz from 'components/quiz/Quiz';

export default (
  <Route path='/' component={App}>
    <Route
      name='topic'
      path='topics/:articleId'
      component={TopicHighlighter} />
    <Route
      name='quiz'
      path='quiz'
      component={Quiz} />
  </Route>
);
