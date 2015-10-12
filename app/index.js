import React from 'react';
import Routes from 'routes';
import Router from 'react-router';

import './styles/app.scss';

function run() {
  let elem = document.createElement('div');
  elem.id = ('react-root');
  document.body.appendChild(elem);

  Router.run(
    Routes,
    (Handler) => {
      React.render(<Handler/>, document.getElementById('react-root'));
    }
  );
}

run();
