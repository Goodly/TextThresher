import React from 'react';
import Answer from 'components/answer';

export default React.createClass({
  displayName: 'Question',

  contextTypes: {
    topics: React.PropTypes.array.isRequired,
    params: React.PropTypes.object.isRequired
  },

  render() {
    const params = this.context.params;
    let topic = this.context.topics[params.topic_id];
    let question = topic.questions[params.question_id];

    let answers = question.answers.map((answer) => {
      return (
        <Answer answer={answer} key={answer.id} parentId={question.id}/>
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
