import React from 'react';
import jquery from 'jquery';
import CollapsibleList from 'components/CollapsibleList';

import 'TopicPicker.scss';

export default React.createClass({
  displayName: 'TopicPicker',

  propTypes: {
    topics: React.PropTypes.array.isRequired,
    topicsTmp: React.PropTypes.array.isRequired
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
          Topic 1 is cottage cheese mascarpone croque monsieur hard cheese. Ricotta.

          Cow monterey jack taleggio. Cream cheese say cheese cheese triangles cut the cheese when the cheese comes out everybody is happy parmesan cheesecake say cheese. Boursin cut the cheese jarlsberg goat pecorino everyone loves cheesy feet stinking bishop.
        ` },
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

    function deleteMeSomeday() {
      function activateTopic(topic) {
        $('.topic-picker__nav li').removeClass('active');
        $(`.topic-picker__nav li[data-topic='${topic}']`).addClass('active');
        $('.text-wrapper__text').attr('data-topic', topic);

        $('.topic-wrapper').hide();
        $(`.topic-wrapper[data-topic="${topic}"]`).show();
      }

      $(document).ready(() => {
        $('.topic-picker__pin-button').click(function() {
          $('.topic-picker').toggleClass('topic-picker--open');
          $(this).toggleClass('fa-inverse');
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
      <div className='topic-picker topic-picker--left'>
        <ul className='topic-picker__nav'>
          { this.props.topicsTmp.map(topic => {
            return (
              <li data-topic={topic.id}
                  style={{height: 100 / this.props.topicsTmp.length + '%'}}>
                <b>{topic.name}</b>
              </li>
            );
          })}
        </ul>
        <div className='topic-picker__wrapper'>
          <div className='topic-picker__pin-button'>
            <i className='fa fa-thumb-tack fa-lg'></i>
          </div>
          { this.props.topicsTmp.map(topic => {
            return (
              <div className='topic-wrapper' data-topic={topic.id}>
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
