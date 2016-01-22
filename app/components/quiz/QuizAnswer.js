import React from 'react';
import AppStore from 'store/appStore';

export default React.createClass({
  displayName: 'QuizAnswer',

  contextTypes: {
    router: React.PropTypes.func
  },

  propTypes: {
    answer: React.PropTypes.object.isRequired
  },

  render() {
    var answer = this.props.answer;
    return (
      <div className="quiz__answer">
        <input
           type={answer.type === 'checkbox' ? 'checkbox' : 'radio'}
           name={answer.question}
           className="quiz__answer"
           value={answer.text}>
          {' ' + answer.text}
        </input>
        <br/>
      </div>
    );
  }

});
