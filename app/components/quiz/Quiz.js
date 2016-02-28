import React from 'react';
import QuizQuestion from 'components/quiz/QuizQuestion.js';
import 'Quiz.scss';
import ReactCSSTransitionsGroup from 'react-addons-css-transition-group';
import 'fadeIn.scss';
import classNames from 'classnames';

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
            { text: 'a', question: 1},
            { text: 'b', question: 1},
            { text: 'c', question: 1},
            { text: 'd', question: 1}
          ],
          type: 'checkbox'
        },
        {
          id: 2,
          text: 'Dummy question 2',
          context: {
            text: 'Dummy context for display purposes only',
            highlights: [[6, 13], [26, 34]]
          },
          answers: [
            { text: 'a', question: 2},
            { text: 'b', question: 2},
            { text: 'c', question: 2},
            { text: 'd', question: 2}
          ],
          type: 'radio'
        },
        {
          id: 3,
          text: 'Dummy question 3',
          context: {
            text: 'Dummy context for display purposes only',
            highlights: [[6, 13], [26, 34]]
          },
          answers: [
            { text: 'a', question: 3},
            { text: 'b', question: 3},
            { text: 'c', question: 3},
            { text: 'd', question: 3}
          ],
          type: 'radio'
        }
      ]
    };
  },

  getInitialState: function() {
    var questionFlags = {}
    for (var i = 0; i < this.props.questions.length; i++) {
      questionFlags[this.props.questions[i].id] = false
    }
    return {questionAnswerFlags: questionFlags};
  },

  onUpdate: function(questionId, onAnswered) {
    var questionFlags = this.state.questionAnswerFlags;
    questionFlags[questionId] = onAnswered;
    this.setState({questionAnswerFlags: questionFlags});
  },

  canClickNext: function() {
    var questionFlags = this.state.questionAnswerFlags;
    for (var key in questionFlags) {
      if (!questionFlags[key]) {
        return false;
      }
    }
    return true;
  },

  prompt: function() {
    var questionFlags = this.state.questionAnswerFlags;
    for (var key in questionFlags) {
      if (questionFlags[key]) {
        return true;
      }
    }
    return false;
  },

  render() {
    var opts = this.canClickNext() ? {} : {disabled: true};
    return (
      <ReactCSSTransitionsGroup transitionName='fadein' transitionAppear>
        <span className={classNames('prompt', {active: this.prompt()})}>Please highlight the text from below</span>
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
      </ReactCSSTransitionsGroup>
    );
  }

});
