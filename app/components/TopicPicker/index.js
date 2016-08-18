import React from 'react';
import { fetchTopic } from 'actions/article';
import { connect } from 'react-redux';
import { activateTopic } from 'actions/article';
const $ = require('jquery');
/*
var script = document.createElement('script');
script.src = 'http://code.jquery.com/jquery-1.11.0.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);*/

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

  /*componentDidMount() {
    // TODO: once everything is react-ified we shouldn't need jquery
    // though this is arguably much less boilerplate code than react
    //var $ = jquery;
    var _this = this;

    /*
    What does this do?
    activateTopic:
    - removes active from all list elements
    - adds active class to the current topic's list element
    - change the data-topic attribute to the current topic
    - hide all topic-wrappers
    - show onlythe topic-wrapper of the current topic
    - calls onActivateTopic of the original props to activate the topic

    document.ready section:
    - when pin-bottom is clicked,
    - topic picker add topic-picker--open class
    - changes button to topic-pocker__pin-buttom--active
    - when topic-picker__nav li element is clicked activateTopic of that element,
    with its data-topic attribute as the parameter
    */



    /*function deleteMeSomeday() {
      function activateTopic(topic) {
        $('.topic-picker__nav li').removeClass('active'); //done
        $(`.topic-picker__nav li[data-topic='${topic}']`).addClass('active'); //done
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
  },*/

  activateTopic(topic) {
    this.props.onActivateTopic(topic);
  },

  render() {
    var colors =['rgb(241, 96, 97)', 'rgb(253, 212, 132)', 'rgb(175, 215, 146)', 'rgb(168, 210, 191)', 'rgb(255,153,000)', 'rgb(102,000,153)', 'rgb(000,153,153)', 'rgb(255,102,255)', 'rgb(000,051,153)', 'rgb(153,000,204)', 'rgb(70,194,64)', 'rgb(94,242,188)'];
    var index = -1;
    var classname;
    var list = this.props.topics.map(topic => {
      index += 1;
      classname = 'inactive';
      if (topic == this.props.currentTopic){
        classname = 'active';
      } else {
      return (
        <li key={topic.id}
            className={classname}
            onClick={this.activateTopic(topic.id)}
            data-topic={topic.id}
            style={{height: 100 / this.props.topics.length + '%', color: colors[index]}}
        >
          <b>{topic.name}</b>
        </li>

    )}
  });





    //let topics = this.props.topics;

    return (
      <div className='topic-picker topic-picker--left topic-picker--open'>
        <ul className='topic-picker__nav'>
          /*{ this.props.topics.map(topic => {
            return (
              <li key={topic.id}
                  data-topic={topic.id}
                  style={{height: 100 / this.props.topics.length + '%'},
                   {color: }}
              >
                <b>{topic.name}</b>
              </li>
            );
          })}*/
          {list}
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
