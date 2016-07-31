import React from 'react';
import { fetchTopic } from 'actions/article';
import { connect } from 'react-redux';

import { styles } from './styles.scss';

const mapDispatchToProps = dispatch => {
  return {
    onActivateTopic: (topic) => {
      dispatch(activateTopic(topic));
    }
  };
}

const mapStateToProps = state => {
  return {
    topic: state.currentTopic
  };
}

const TopicPicker = React.createClass({
  displayName: 'TopicPicker',

  propTypes: {
    topics: React.PropTypes.array.isRequired,
  },

  activateTopic(topicId, props) {
    console.log(topicId);
  },

  render() {
    let topics = this.props.topics;

    return (
      <div className='topic-picker topic-picker--left topic-picker--open'>
        <div className="topic-picker__header">
          Click a topic name to change highlighter color
        </div>
        <ul className='topic-picker__nav'>
          { topics.map(topic => {
            return (
              <li onClick={this.activateTopic.bind(this, topic.id, this.props)} key={topic.id}>
                <b>{topic.name}</b>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TopicPicker);
