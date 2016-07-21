import React from 'react';
import jquery from 'jquery';
import CollapsibleList from 'components/collapsibleList';
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

  getDefaultProps() {
  },

  componentDidMount() {
  },

  toggleTopicTray() {
    // DO WE NEED THIS FUNCTIONALITY?
    console.log('toggleTopicTray');
  },

  activateTopic(e) {
    console.log(e);
  },


  render() {
    let topics = this.props.topics;

    return (
      <div className='topic-picker topic-picker--left topic-picker--open'>
        <ul className='topic-picker__nav'>
          { topics.map(topic => {
            return (
              <li onClick={this.activateTopic} key={topic.id}
                  data-topic={topic.id}
                  style={{height: 100 / topics.length + '%'}}
              >
                <b>{topic.name}</b>
              </li>
            );
          })}
        </ul>
        <div className='topic-picker__wrapper'>
          {topics.map(topic => {
            return (
              <div key={topic.id} className='topic-wrapper' data-topic={topic.id}>
                <div className='topic-wrapper__topic'>
                  { topic.description }
                  <CollapsibleList />
                </div>
              </div>
            )})
          }
          <div className='topic-picker__pin-button topic-picker__pin-button--active' onClick={this.toggleTopicTray}>
            <i className='fa fa-thumb-tack fa-lg'></i>
          </div>
        </div>
      </div>
    );
  }

});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TopicPicker);
