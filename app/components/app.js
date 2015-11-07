import React from 'react';
import {RouteHandler} from 'react-router';
import objectAssign from 'object-assign';
import ListenerMixin from 'alt/mixins/ListenerMixin';

import AppStore from 'store/appStore';

export default React.createClass({
  displayName: 'AppLayer',
  mixins: [ListenerMixin],

  getInitialState() {
    return AppStore.getState();
  },

  componentDidMount() {
    AppStore.listen(this.onChange);
  },

  onChange(state) {
    this.setState(this.getInitialState());
  },

  render() {
    const props: Object = objectAssign(this.state, this.props);

    return (
      <div className="app">
        <RouteHandler {...props} />
      </div>
    );
  }
});
