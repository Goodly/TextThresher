import React from 'react';

export default React.createClass({
  displayName: 'Article',

  contextTypes: {
    params: React.PropTypes.object.isRequired
  },

  propTypes: {
    article: React.PropTypes.object.isRequired,
    topics: React.PropTypes.array.isRequired
  },

  render() {
    const {topic_id}: string = this.context.params
    let article = this.props.article;
    let topic = this.props.topics[topic_id];

    return (
      <div>
        <div className='tua__header-text'>
          Focus on the bold text about '{topic.name}' and answer the questions.
        </div>
        <div className='article'>{article.text}</div>
      </div>
    );
  }

});
