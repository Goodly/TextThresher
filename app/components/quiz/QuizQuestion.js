import React from 'react';
import AppStore from 'store/appStore';
import QuizAnswer from 'components/quiz/QuizAnswer.js';
import QuizContext from 'components/quiz/QuizContext.js';

export default React.createClass({
  displayName: 'QuizQuestion',

  contextTypes: {
    router: React.PropTypes.func
  },

  propTypes: {
    question: React.PropTypes.object.isRequired,
    onUpdate: React.PropTypes.func.isRequired
  },

  onChange: function(e) {
    // just propagate up to parent
    this.props.onUpdate(e);
  },

  render() {
    return (
      <div className="quiz__question">
        <QuizContext context={this.props.question.context} />
        <br/>
        <p>{this.props.question.text}</p>
        <form onChange={this.onChange}>
          {this.props.question.answers.map((answer, i) => {
            return <QuizAnswer key={answer.text} answer={answer}/>;
          })}
        </form>
      </div>
    );
  }

});
