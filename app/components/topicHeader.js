import React from 'react';

export default React.createClass({
  displayName: 'TopicHeader',

  contextTypes: {
    params: React.PropTypes.object.isRequired
  },

  propTypes: {
    topics: React.PropTypes.array.isRequired
  },

  render() {
    const {topic_id}: string = this.context.params
    let topic = this.props.topics[topic_id];
    return (
      <div className='tua__header-text'>
        Focus on the bold text about '{topic.name}' and answer the questions.
      </div>
    );
  }

});
