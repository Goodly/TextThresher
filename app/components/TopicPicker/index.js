import React from 'react';
import { fetchTopic } from 'actions/article';
import { connect } from 'react-redux';
import { activateTopic,passTopic } from 'actions/article';
import {CollapsibleList} from 'components/CollapsibleList';
var Radium = require('radium');
import { styles } from './styles.scss';

const mapDispatchToProps = dispatch => {
  return {
    onActivateTopic: (topic) => {
      dispatch(activateTopic(topic));
    },
  };
}

/*const mapStateToProps = state => {
  console.log('TOPICPICKER STATE')
  console.log(state)
  return {
    currentTopic: state.currentTopic
  };
}*/

const TopicPicker = React.createClass({
  displayName: 'TopicPicker',

  propTypes: {
    topics: React.PropTypes.array.isRequired,
    onActivateTopic: React.PropTypes.func,
    currentTopic: React.PropTypes.string.isRequired,
    //colors: React.PropTypes.array.isRequired
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
    var colors =this.props.colors;
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
            style={styles.listElement}
        >
          <b>{topic.name}</b>
        </li>
      );
    });
    var topicInfo = this.props.topics.map(topic => {
        return (
          <div key={topic.id} className='topic-wrapper' data-topic={topic.id}>
            <div className='topic-wrapper_topic'>
              {topic.glossary}
            </div>
          </div>
        )
    });

    return (
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
    );
  }
});

export default connect(
  null,
  mapDispatchToProps
)(Radium(TopicPicker));
