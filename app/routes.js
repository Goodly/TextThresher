import React from 'react';
import { Route } from 'react-router';

import App from 'containers/App';
import { MockHighlighter } from 'containers/HighlighterTasks';
import { MockQuiz } from 'containers/QuizTasks';

export default (
  <Route path='/' component={App}>
    <Route path='highlighter' component={MockHighlighter} />
    <Route path='quiz' component={MockQuiz} />
  </Route>
);
