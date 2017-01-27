import { Quiz } from 'components/Quiz';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as quizActionCreators from 'actions/quiz';
import * as projectActionCreators from 'actions/project';

// Actions for MockQuiz
import * as taskActionCreators from 'actions/quizTasks';
// API for RealQuiz
import runPybossaTasks from 'pybossa/quiz';

const assembledActionCreators = Object.assign(
  {},
  quizActionCreators,
  projectActionCreators,
  taskActionCreators
);

const mapStateToProps = state => {
  var taskQueue = null;
  var currTask = null;
  if(state.quizTasks.taskDatabase.entities && state.quizTasks.taskDatabase.result && state.quizTasks.taskQueue) {
    taskQueue = state.quizTasks.taskQueue;
    var taskNum = state.quizTasks.taskDatabase.result[0];
    currTask = state.quizTasks.taskDatabase.entities.tasks[taskNum];
  }
  return {
    saveAndNext: state.quiz.saveAndNext,
    taskQueue,
    currTask
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
    runPybossaTasks(this.props.storeQuestion,
                    this.props.storeProject,
                    this.props.storeSaveAndNext);
  }
};
