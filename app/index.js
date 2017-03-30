import React from 'react';
import { render } from 'react-dom';
import { Router, hashHistory } from 'react-router';
import Routes from 'routes';

import { introJs } from 'intro.js/intro.js';
const style = require('intro.js/introjs.css');

render(
  <Router
    history={ hashHistory }
    routes={ Routes } />,
  document.getElementById('react-root')
);

introJs().start();
