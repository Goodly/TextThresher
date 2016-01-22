import React from 'react';
import {Route, NotFoundRoute} from 'react-router';

export default (
  <Route name='app' path='/' handler={require('./components/app')}>
    <Route
      name='tuaAnalysis'
      path='tua/:tua_id'
      handler={require('./components/tua')}>
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
      handler={require('./components/quiz/Quiz')} />
    <NotFoundRoute
      handler={require('./components/error')} />
  </Route>
);
