import React from 'react';
import AppStore from 'store/appStore';

export default React.createClass({
  displayName: 'TopicHeader',

  contextTypes: {
    router: React.PropTypes.func
  },

  propTypes: {
    topics: React.PropTypes.object.isRequired
  },

  render() {
    const {topic_id}: string = this.context.router.getCurrentParams();
    let topic = this.props.topics[topic_id];

    return (
      <div className="tua__header-text">
        Focus on the bold text about '{topic.name}' and answer the questions.
      </div>
    );
  }

});
