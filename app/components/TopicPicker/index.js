import React from 'react';
import { fetchTopic } from 'actions/article';
import { connect } from 'react-redux';
import { activateTopic } from 'actions/article';
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
    console.log('clicked')
    this.props.onActivateTopic(topic);
  },

  /*triggerBackground(this, color){
    this.style.backgroundColor = color
  },*/

  /*test(func1, func2) {
    //this.activateTopic.bind(this,id);
    //this.forceUpdate()
    func1
    func2
  },*/

  render() {
    var colors =['rgb(241, 96, 97)', 'rgb(253, 212, 132)', 'rgb(175, 215, 146)', 'rgb(168, 210, 191)', 'rgb(255,153,000)', 'rgb(102,000,153)', 'rgb(000,153,153)', 'rgb(255,102,255)', 'rgb(000,051,153)', 'rgb(153,000,204)', 'rgb(70,194,64)', 'rgb(94,242,188)'];
    var index = -1;
    var classname;
    var defcolor;
    var list = this.props.topics.map(topic => {
      var topic_id = topic.id + ''
      var func = this.activateTopic.bind(this, topic_id);
      //var update = this.forceUpdate();
      //var func = this.test(funct, update)
      //var func = this.test(topic_id)
      index += 1;
      /*triggerBackground(this, color){
        this.style.backgroundColor = color
      }
      restoreBackground(this, color){
        this.style.backgroundColor = color
      }*/


      /*classname = reactCSS({
        'default': {
          card: {
            backgroundColor: colors[index],
            height: 100 / this.props.topics.length + '%',
          }
        },
        'hover': {
          card: {
            backgroundColor: '#4c4545',
            height: 100 / this.props.topics.length + '%',
          },
        },
      })*/

      console.log(this.props.currentTopic)
      defcolor = '#4c4545';
      if (topic_id == this.props.currentTopic){
        defcolor = colors[index]
      } else {
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
              //className={classname.card}
              //onClick={(func) => {
              //  func;
              //}}
              onClick={func}
              //onMouseOver={this.triggerBackground(colors[index])}
              //onMouseOut={this.style.backgroundColor = defcolor}
              data-topic={topic.id}
              style={styles.listElement/*{height: 100 / this.props.topics.length + '%', backgroundColor: defcolor}*/}
          >
            <b>{topic.name}</b>
          </li>
        );
      }
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
  mapStateToProps,
  mapDispatchToProps
)(Radium(TopicPicker));
