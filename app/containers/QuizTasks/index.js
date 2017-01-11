import { Quiz } from 'components/Quiz';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

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

const mapStateToProps = state => {
  return {
    question: state.quiz.question,
    saveAndNext: state.quiz.saveAndNext
  };
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

@connect (
  mapStateToProps,
  dispatch => bindActionCreators(assembledActionCreators, dispatch)
)
export class RealQuiz extends Quiz {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // runPybossaTasks(/* TBD actions */);
  }
};
