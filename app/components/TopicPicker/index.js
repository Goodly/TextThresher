import React from 'react';
import { fetchTopic } from 'actions/article';
import { connect } from 'react-redux';
import { activateTopic,passTopic } from 'actions/article';
//import {} from 'actions/topicpicker';
//import reactCSS, { hover } from 'reactcss'
var Radium = require('radium');
//const $ = require('jquery');
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
    },
  };
}

const mapStateToProps = state => {
  console.log('TOPICPICKER STATE')
  console.log(state)
  return {
    //topic: state.currentTopic,
    currentTopic: state.currentTopic
  };
}

const TopicPicker = React.createClass({
  displayName: 'TopicPicker',

  propTypes: {
    topics: React.PropTypes.array.isRequired,
    onActivateTopic: React.PropTypes.func,
    currentTopic: React.PropTypes.string.isRequired
  },

  /*childContextTypes: {
    topics: React.PropTypes.array.isRequired
  },

  getChildContext() {
    console.log('context')
    console.log(this.props)
    return {
      //topics: this.props.topics,
      //currentTopic: this.props.currentTopic
    };
  },*/

  componentDidMount() {
      this.activateTopic('1');
  },

  activateTopic(topic) {
    this.props.onActivateTopic(topic);
    //this.props.onPassTopic(topic);
  },

  render() {
    var colors =['rgb(241, 96, 97)', 'rgb(253, 212, 132)', 'rgb(175, 215, 146)', 'rgb(168, 210, 191)', 'rgb(255,153,000)', 'rgb(102,000,153)', 'rgb(000,153,153)', 'rgb(255,102,255)', 'rgb(000,051,153)', 'rgb(153,000,204)', 'rgb(70,194,64)', 'rgb(94,242,188)'];
    var index = -1;
    var defcolor;
    console.log('TOPICPICKER RENDER')
    console.log(this.props)

    var list = this.props.topics.map(topic => {
      var topic_id = topic.id + ''
      var func = this.activateTopic.bind(this, topic_id);
      index += 1;

      defcolor = '#4c4545';

      if (topic_id == this.props.currentTopic){
        defcolor = colors[index]
      }
      var styles = {
        listElement: {
          backgroundColor: defcolor,
          height: 100 / this.props.topics.length + '%',
           ':hover': {
             backgroundColor: colors[index]
          }
        }
      }
      return (
        <li key={topic.id}
            onClick={func}
            data-topic={topic.id}
            style={styles.listElement/*{height: 100 / this.props.topics.length + '%', backgroundColor: defcolor}*/}
        >
          <b>{topic.name}</b>
        </li>
      );

    });
    return (
      <div className='topic-picker topic-picker--left topic-picker--open'>
        <ul className='topic-picker__nav'>
          {list}
        </ul>
      </div>
    );
  }
});

export default connect(
  null,
  mapDispatchToProps
)(Radium(TopicPicker));
