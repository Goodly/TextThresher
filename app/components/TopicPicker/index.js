import React from 'react';
import { connect } from 'react-redux';
import { styles } from './styles.scss';
import { activateTopic } from 'actions/topicPicker';
var Radium = require('radium');

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
    idDict: state.topicPicker.idDict
  };
}

const TopicInstruction = React.createClass({
  displayName: 'Instruction',

  render() {
    var color = this.props.color;
    var topicColor = {
        borderTop: 'solid',
        borderWidth: '10px',
        borderColor: color,
    };
    return (
      <div className="instructions" style={topicColor}>
        <strong>Instructions: </strong>  
         {this.props.instruction}
      </div>
      );
  }

});

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

const TopicPicker = React.createClass({
  displayName: 'TopicPicker',

  propTypes: {
    topics: React.PropTypes.object.isRequired,
    currentTopicId: React.PropTypes.number.isRequired,
    onActivateTopic: React.PropTypes.func.isRequired,
  },

  activateTopic(topic) {
    this.props.onActivateTopic(topic);
  },

  render() {
    var colors = ['rgb(241, 96, 97)', 'rgb(253, 212, 132)', 'rgb(175, 215, 146)', 'rgb(168, 210, 191)', 'rgb(255,153,000)', 'rgb(102,000,153)', 'rgb(000,153,153)', 'rgb(255,102,255)', 'rgb(000,051,153)', 'rgb(153,000,204)', 'rgb(70,194,64)', 'rgb(94,242,188)'];

    var topic_array = this.props.topics.results;
    var list = topic_array.map( (topic, index) =>
        <TopicItem key={topic.id}
                   topic={topic}
                   currentTopicId={this.props.currentTopicId}
                   color={colors[index]}
                   height={100 / topic_array.length + '%'}
                   clickFunc={this.activateTopic.bind(this, topic.id)} />);
    var full_inst = this.props.idDict ? this.props.idDict[this.props.currentTopicId][1].instructions : "";
    var instructions = full_inst.length > 500 ? full_inst.substring(0,500) + "..." : full_inst;
    var index = this.props.idDict ? this.props.idDict[this.props.currentTopicId][0]: 0;

    return (
      <div>
        <div className='topic-picker topic-picker--left topic-picker--open'>
          <ul className='topic-picker__nav'>
            {list}
          </ul>
          <div className='topic-picker__wrapper'>
            <div className='topic-picker__pin-button topic-picker__pic-button--active'>
              <i className='fa fa-thumb-tack fa-lg'></i>
            </div>
          </div>
        </div>
        
        <TopicInstruction instruction={instructions} color={colors[index]}/>

      </div>
    );
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Radium(TopicPicker));
