import React from 'react';
import { fetchTopic } from 'actions/article';
import { connect } from 'react-redux';
import { activateTopic } from 'actions/article';
import jquery from 'jquery';

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
    onActivateTopic: React.PropTypes.func
  },

  childContextTypes: {
    topics: React.PropTypes.array.isRequired
  },

  getChildContext() {
    return {
      topics: this.props.topics
    };
  },

  getDefaultProps() {
    return {
      // TODO: we're getting topics in props, but it's structure looks outdated
      // in any case it needs to be removed or refactored as topic data
      // should filter down
      topicsTmp: [
        { id: '1', name: 'Topic 1',
          description: `
          Topic 1 is Foo...` },
        { id: '2', name: 'Topic 2', description: 'Topic 2 is placeholder' },
        { id: '3', name: 'Topic 3', description: '' },
        { id: '4', name: 'Topic 4', description: '' }
      ]
    };
  },

  componentDidMount() {
    // TODO: once everything is react-ified we shouldn't need jquery
    // though this is arguably much less boilerplate code than react
    var $ = jquery;
    var _this = this;
    console.log('in mount')
    console.log(this.props.topics)
    function deleteMeSomeday() {
      function activateTopic(topic) {
        $('.topic-picker__nav li').removeClass('active');
        $(`.topic-picker__nav li[data-topic='${topic}']`).addClass('active');
        $('.text-wrapper__text').attr('data-topic', topic);

        $('.topic-wrapper').hide();
        $(`.topic-wrapper[data-topic="${topic}"]`).show();

        _this.props.onActivateTopic(topic);
      }

      $(document).ready(() => {
        $('.topic-picker__pin-button').click(function() {
          $('.topic-picker').toggleClass('topic-picker--open');
          $(this).toggleClass('topic-picker__pin-button--active');
        });
        $('.topic-picker__nav li').click(function() {
          activateTopic($(this).attr('data-topic'));
        });

        activateTopic('1');
      });
    }
    deleteMeSomeday();
    console.log('topicpicker')
    console.log(this.props)
    console.log
  },

  /*activateTopic(topicId, props) {
    console.log(topicId);
  },*/

  render() {
    let topics = this.props.topics;

    return (
      <div className='topic-picker topic-picker--left topic-picker--open'>
        <ul className='topic-picker__nav'>
          { this.props.topics.map(topic => {
            return (
              <li key={topic.id}
                  data-topic={topic.id}
                  style={{height: 100 / this.props.topics.length + '%'}}
              >
                <b>{topic.name}</b>
              </li>
            );
          })}
        </ul>
      </div>
      /*<div className='topic-picker topic-picker--left topic-picker--open'>
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
      </div>*/
    );
  }

});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TopicPicker);
