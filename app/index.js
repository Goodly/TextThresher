import React from 'react';
import {render} from 'react-dom';
import {Router, hashHistory} from 'react-router';
import Routes from 'routes';

import 'app.scss';

let elem = document.createElement('div');
elem.id = ('react-root');
document.body.appendChild(elem);

render(
  <Router
    history={ hashHistory }
    routes={ Routes } />,
  document.getElementById('react-root')
);
