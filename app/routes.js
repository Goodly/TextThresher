import React from 'react';
import { Route } from 'react-router';

import App from 'containers/App';
import { TopicHighlighter } from 'containers/TopicHighlighter';
import {Quiz} from 'containers/Quiz';

export default (
  <Route path='/' component={App}>
    <Route path='article/:articleId' component={TopicHighlighter} />
    <Route path='quiz/:annotationId' component={Quiz} />
  </Route>
);
