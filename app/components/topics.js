import React from 'react';
import {RouteHandler} from 'react-router';
import objectAssign from 'object-assign';
import ListenerMixin from 'alt/mixins/ListenerMixin';

import Article from 'components/article';
import Question from 'components/question';
import AppStore from 'store/appStore';

export default React.createClass({
  displayName: 'Topic',
  mixins: [ListenerMixin],

  getChildContext() {
    return {
      topics: this.props.topics
    };
  },

  childContextTypes: {
    topics: React.PropTypes.object.isRequired
  },

  contextTypes: {
    router: React.PropTypes.func
  },

  propTypes: {
    topics: React.PropTypes.object.isRequired
  },

  getInitialState() {
    return AppStore.getState();
  },

  render() {
    const {topicId}: string = this.context.router.getCurrentParams();

    return (
      <div>
        <Question/>
      </div>
    );
  }

});
