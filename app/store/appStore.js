import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../reducers';


export default function configureStore(initialState) {
  const store = createStore(rootReducer,
    initialState,
    applyMiddleware(thunk),
    compose(
    window.devToolsExtension ? window.devToolsExtension() : _ => _
  ));

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers').default;
      store.replaceReducer(nextReducer);
    })
  }

  return store;
}
