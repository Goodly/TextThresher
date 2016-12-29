import React from 'react';
import { Route } from 'react-router';

import App from 'containers/App';
import { MockHighlighter } from 'containers/HighlighterTasks';
import {Quiz} from 'containers/Quiz';

export default (
  <Route path='/' component={App}>
    <Route path='highlighter' component={MockHighlighter} />
    <Route path='quiz' component={Quiz} />
  </Route>
);
