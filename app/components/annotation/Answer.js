// TODO: marked for deletion: topic picking view doesn't need Q&A
import React from 'react';

export default React.createClass({
  displayName: 'Answer',

  propTypes: {
    answer: React.PropTypes.object.isRequired,
    parentId: React.PropTypes.number.isRequired
  },

  render() {
    let answer = this.props.answer;
    let parentId = `parentId-${this.props.parentId}`;

    return (
      <div className='answerWrapper'>
        <input className='survey-unit__answer' type='radio' value={answer.id} id={answer.answer_id} name={parentId}/>
          {answer.text}
      </div>
    );
  }
});
