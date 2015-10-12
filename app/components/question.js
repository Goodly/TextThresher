import React from 'react';
import AppStore from 'store/appStore';
import ListenerMixin from 'alt/mixins/ListenerMixin';

import Answer from 'components/answer';

export default React.createClass({
  displayName: 'Question',
  mixins: [ListenerMixin],

  contextTypes: {
    topics: React.PropTypes.object.isRequired,
    router: React.PropTypes.func
  },

  propTypes: {
    questions: React.PropTypes.array.isRequired
  },

  render() {
    // #TODO: smarten up this object inheritance
    const router = this.context.router.getCurrentParams();
    let topic = this.context.topics[router.topic_id];
    let question = topic.questions[router.question_id];
    let answers = question.answers.map((answer) => {
      return (
        <Answer answer={answer} parentId={question.id}/>
      );
    });

    return (
      <div className='question-block'>
        <div className='question-block__text'>
          {question.text}
        </div>
        <div className='answer-block'>
          {answers}
        </div>
      </div>
    );
  }

});
