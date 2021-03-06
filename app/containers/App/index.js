import React, { Component } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'store/appStore.js';

export const store = configureStore();

/* global styles for app */
import './styles.scss';

export default class App extends Component {

  constructor(props) {
    super(props);
  }

  static propTypes = {
    children: React.PropTypes.object.isRequired
  }

  render() {
    return (
      <Provider store={store}>
        <div className='app'>
          {this.props.children}
        </div>
      </Provider>
    );
  }
}
