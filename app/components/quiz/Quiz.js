import React from 'react';
import QuizQuestion from 'components/quiz/QuizQuestion.js';
import 'Quiz.scss';

export default React.createClass({
  displayName: 'Quiz',

  propTypes: {
    questions: React.PropTypes.array.isRequired
  },

  getDefaultProps: function() {
    // TODO: receive this as an action
    return {
      questions: [
        {
          id: 1,
          text: 'Dummy question',
          context: {
            text: 'Dummy context for display purposes only',
            highlights: [[6, 13], [26, 34]]
          },
          answers: [
            { text: 'a', question: 1, type: 'radio'},
            { text: 'b', question: 1, type: 'radio'},
            { text: 'c', question: 1, type: 'radio'},
            { text: 'd', question: 1, type: 'radio'}
          ]
        }
      ]
    };
  },

  getInitialState: function() {
    return {answer: []};
  },

  onUpdate: function(e) {
    // if you mix checkboxes and radio buttons there's undefined behavior
    if (e.target.type === 'radio') {
      // a radio button
      this.setState({answer: [e.target.value]});
    }
    else {
      // a checkbox
      var newAnswers = new Set(this.state.answer);
      if (e.target.checked) {
        newAnswers.add(e.target.value);
      }
      else {
        newAnswers.delete(e.target.value);
      }
      newAnswers = Array.from(newAnswers);
      this.setState({answer: newAnswers});
    }
  },

  render() {
    var opts = this.state.answer.length !== 0 ? {} : {disabled: true};
    return (
      <div className='quiz'>
        {this.props.questions.map((question) => {
          return (
            <QuizQuestion key={question.id}
                          question={question}
                          onUpdate={this.onUpdate} />
          );
        })}
        <button className='quiz__next' {...opts}>Next</button>
      </div>
    );
  }

});
