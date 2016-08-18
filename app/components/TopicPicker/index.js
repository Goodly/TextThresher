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

  /*getDefaultProps() {
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
  },*/

  componentDidMount() {
      this.activateTopic('1');
  },

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
