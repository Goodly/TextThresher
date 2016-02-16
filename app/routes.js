import React from 'react';
import {Route} from 'react-router';

import App from './components/app';
import Tua from './components/annotation/Tua';
import Quiz from './components/quiz/Quiz';

export default (
  <Route name='app' path='/' component={App}>
    <Route
      name='tuaAnalysis'
      path='tua/:tua_id'
      component={Tua}>
      <Route
        name='topicAnalysis'
        path='topic/:topic_id'>
        <Route
          name='questionAnalysis'
          path='question/:question_id'/>
      </Route>
    </Route>
    <Route
      name='quiz'
      path='quiz'
      component={Quiz} />
  </Route>
);
