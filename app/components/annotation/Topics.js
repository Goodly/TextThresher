// TODO: marked for deletion: topic picking view doesn't need Q&A
import React from 'react';
import Question from 'components/annotation/Question';

export default React.createClass({
  displayName: 'Topics',

  propTypes: {
    topics: React.PropTypes.array.isRequired
  },

  contextTypes: {
    params: React.PropTypes.object.isRequired
  },

  childContextTypes: {
    topics: React.PropTypes.array.isRequired,
    params: React.PropTypes.object.isRequired
  },

  getChildContext() {
    return {
      topics: this.props.topics,
      params: this.context.params
    };
  },

  render() {
    return (
      <div>
        <Question/>
      </div>
    );
  }

});
