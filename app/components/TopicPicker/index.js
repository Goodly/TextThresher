import React, { Component } from 'react';
import { connect } from 'react-redux';
import { styles } from './styles.scss';
import { activateTopic } from 'actions/topicPicker';
var Radium = require('radium');
import { colors } from 'utils/colors';

const mapDispatchToProps = dispatch => {
  return {
    onActivateTopic: (topic) => {
      dispatch(activateTopic(topic));
    }
  };
}

const mapStateToProps = state => {
  return {
    currentTopicId: state.topicPicker.currentTopicId,
    lookupTopicById: state.topicPicker.lookupTopicById
  };
}

class TopicInstructionComponent extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    var topicLookup = this.props.lookupTopicById[this.props.currentTopicId];
    var index = topicLookup[0];
    var full_inst = topicLookup[1].instructions;
    var instructions = full_inst.length > 500 ? full_inst.substring(0,500) + "..." : full_inst;


    var styles = {
        borderTop: 'solid',
        borderWidth: '10px',
        borderColor: colors[index],
    };
    return (
      <div className="instructions"
        style={[styles, this.props.instrStyle]}>
        <strong>Instructions: </strong>
         {instructions}
      </div>
      );
  }
};

TopicInstructionComponent.propTypes = {
  instrStyle: React.PropTypes.object.isRequired
};

export let TopicInstruction = connect(
  mapStateToProps,
  mapDispatchToProps
)(Radium(TopicInstructionComponent));

const TopicItem = React.createClass({
  displayName: 'TopicItem',

  propTypes: {
    topic: React.PropTypes.object.isRequired,
    currentTopicId: React.PropTypes.number.isRequired,
    color: React.PropTypes.string.isRequired,
    height: React.PropTypes.string.isRequired,
    clickFunc: React.PropTypes.func.isRequired,
  },

  render() {
    var topic = this.props.topic;
    var color = this.props.color;
    var defcolor = '#4c4545';
    if (topic.id == this.props.currentTopicId) {
      defcolor = color;
    };
    var listElement = {
        backgroundColor: defcolor,
        position: 'relative',
        borderBottom: 'solid',
        borderWidth: '1px',
        borderColor: 'gray',
        height: this.props.height,
         ':hover': {
           backgroundColor: color,
        }
     };
     var topicColor = {
        position: 'absolute',
        height: '90%',
        right: '0px',
        top: '5%',
        width: '10px',
        backgroundColor: color,
    };
    return (
      <li key={topic.id}
          onClick={this.props.clickFunc}
          data-topic={topic.id}
          style={listElement}
      >
        <div style ={topicColor}>
        </div>
        <b>{topic.name}</b>
      </li>
    );
  }
});

const TopicPickerComponent = React.createClass({
  displayName: 'TopicPicker',

  propTypes: {
    topics: React.PropTypes.object.isRequired,
    topicStyle: React.PropTypes.string.isRequired,
    currentTopicId: React.PropTypes.number.isRequired,
    onActivateTopic: React.PropTypes.func.isRequired,
  },

  activateTopic(topic) {
    this.props.onActivateTopic(topic);
  },

  render() {
    var topic_array = this.props.topics.results;
    var list = topic_array.map( (topic, index) =>
        <TopicItem key={topic.id}
                   topic={topic}
                   currentTopicId={this.props.currentTopicId}
                   color={colors[index]}
                   height={100 / topic_array.length + '%'}
                   clickFunc={this.activateTopic.bind(this, topic.id)} />);

    var topicLookup = this.props.lookupTopicById[this.props.currentTopicId];
    var index = topicLookup[0];
    var full_inst = topicLookup[1].instructions;
    var instructions = full_inst.length > 500 ? full_inst.substring(0,500) + "..." : full_inst;

    return (
      <div className={`topic-picker-wrapper ${this.props.topicStyle}`}>
        <div className='topic-picker'>
          <ul className='topic-picker__nav'>
            {list}
          </ul>
        </div>
      </div>
    );
  }
});

export let TopicPicker = connect(
  mapStateToProps,
  mapDispatchToProps
)(Radium(TopicPickerComponent));
