import React from 'react';
import { render } from 'react-dom';

import App from 'containers/App';
import { RealQuiz } from 'containers/QuizTasks';
import { style } from 'styles/pybossa-overrides.scss';

let elem = document.createElement('div');
elem.id = ('react-root');
document.body.appendChild(elem);

render(
  <App>
    <RealQuiz/>
  </App>,
  document.getElementById('react-root')
);
