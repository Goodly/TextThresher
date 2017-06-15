'use strict';

import React from 'react';
import { render } from 'react-dom';

import App from 'containers/App';
import { RealHighlighter } from 'containers/HighlighterTasks';

let elem = document.createElement('div');
elem.id = ('react-root');
document.body.appendChild(elem);

render(
  <App>
    <RealHighlighter/>
  </App>,
  document.getElementById('react-root')
);
