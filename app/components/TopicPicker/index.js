import React from 'react';
import { fetchTopic } from 'actions/article';
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

/*const mapStateToProps = state => {
  return {
    currentTopic: state.currentTopic
  };
}*/

const TopicPicker = React.createClass({
  displayName: 'TopicPicker',

  propTypes: {
    topics: React.PropTypes.object.isRequired,
    currentTopic: React.PropTypes.string.isRequired,
  },

  /*activateTopic(topicId, props) {
    console.log(topicId);
  },*/

  activateTopic(topic) {
    this.props.onActivateTopic(topic);
    //this.props.onPassTopic(topic);
  },

  componentDidMount() {
    console.log('activated 1');
    this.activateTopic('1');
  },

  render() {
    //var colors =this.props.colors;
    var colors = ['rgb(241, 96, 97)', 'rgb(253, 212, 132)', 'rgb(175, 215, 146)', 'rgb(168, 210, 191)', 'rgb(255,153,000)', 'rgb(102,000,153)', 'rgb(000,153,153)', 'rgb(255,102,255)', 'rgb(000,051,153)', 'rgb(153,000,204)', 'rgb(70,194,64)', 'rgb(94,242,188)'];

    var index = -1;
    var defcolor;
    console.log('TOPICPICKER RENDER')
    console.log(this.props)
    var topic_array = this.props.topics.results;

    var list = topic_array.map(topic => {
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
          height: 100 / topic_array.length + '%',
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
    var topicInfo = topic_array.map(topic => {
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
