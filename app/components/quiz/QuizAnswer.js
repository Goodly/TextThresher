import React from 'react';

export default React.createClass({
  displayName: 'QuizAnswer',

  propTypes: {
    answer: React.PropTypes.object.isRequired
  },

  render() {
    var answer = this.props.answer;
    return (
      <div className='quiz__answer'>
        <input
           type={answer.type === 'checkbox' ? 'checkbox' : 'radio'}
           name={answer.question}
           className='quiz__answer'
           value={answer.text}/>
          {' ' + answer.text}
      </div>
    );
  }

});
