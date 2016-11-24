'use strict';

import React from 'react';
import { render } from 'react-dom';

import App from 'containers/App';
import { TopicHighlighter } from 'containers/PybossaHighlighter';

let elem = document.createElement('div');
elem.id = ('react-root');
document.body.appendChild(elem);

render(
  <App>
    <TopicHighlighter/>
  </App>,
  document.getElementById('react-root')
);
