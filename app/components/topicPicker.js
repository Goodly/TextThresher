import React from 'react';
import jquery from 'jquery';
import CollapsibleList from 'components/collapsibleList';
import { activateTopic } from 'actions/article';
import { connect } from 'react-redux';

import 'TopicPicker.scss';

const mapDispatchToProps = dispatch => {
  return {
    onActivateTopic: (topic) => {
      dispatch(activateTopic(topic));
    }
  };
}

const mapStateToProps = state => {
  return { topic: state.currentTopic };
}

const TopicPicker = React.createClass({
  displayName: 'TopicPicker',

  propTypes: {
    topics: React.PropTypes.array.isRequired,
    topicsTmp: React.PropTypes.array.isRequired,
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
  },

  render() {
    // TODO: break this into its component pieces
    // const {topicId}: string = this.context.router.getCurrentParams();

    return (
      <div className='topic-picker topic-picker--left topic-picker--open'>
        <ul className='topic-picker__nav'>
          { this.props.topicsTmp.map(topic => {
            return (
              <li key={topic.id}
                  data-topic={topic.id}
                  style={{height: 100 / this.props.topicsTmp.length + '%'}}
              >
                <b>{topic.name}</b>
              </li>
            );
          })}
        </ul>
        <div className='topic-picker__wrapper'>
          <div className='topic-picker__pin-button topic-picker__pin-button--active'>
            <i className='fa fa-thumb-tack fa-lg'></i>
          </div>
          { this.props.topicsTmp.map(topic => {
            return (
              <div key={topic.id} className='topic-wrapper' data-topic={topic.id}>
                <div className='topic-wrapper__topic'>
                  { topic.description }
                  <CollapsibleList />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TopicPicker);
