import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as quizActionCreators from 'actions/quiz';

// Actions for MockQuiz
import * as taskActionCreators from 'actions/quizTasks';
// API for RealQuiz
// TODO: import runPybossaTasks from 'pybossa/quiz';

const assembledActionCreators = Object.assign(
  {},
  quizActionCreators,
  taskActionCreators
);

import Question from 'components/Question';

import {styles} from './styles.scss';

const mapStateToProps = state => {
  return {
    question: state.quiz.question,
    saveAndNext: state.quiz.saveAndNext
  };
}

export class Quiz extends Component {
  constructor(props) {
    super(props);
  }

  // Babel plugin transform-class-properties allows us to use
  // ES2016 property initializer syntax. So the arrow function
  // will bind 'this' of the class. (React.createClass does automatically.)
  onSaveAndNext = () => {
    this.props.saveAndNext(this.props.answers ? this.props.answers : {});
  }

  render() {
    return (
      <div>
        <Question question={this.props.question}/>
        <button onClick={this.onSaveAndNext}>Save and Next</button>
      </div>
    )
  }
}

@connect (
  mapStateToProps,
  dispatch => bindActionCreators(assembledActionCreators, dispatch)
)
export class MockQuiz extends Quiz {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.fetchQuizTasks();
  }
};
