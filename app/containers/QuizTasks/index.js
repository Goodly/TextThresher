import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Quiz } from 'components/Quiz';
import { storeProject } from 'actions/project';
import { storeQuizTask, storeSaveAndNext } from 'actions/quiz';

// Actions for MockQuiz
import { fetchQuizTasks } from 'actions/quizTasks';
// API for RealQuiz
import runPybossaTasks from 'pybossa/quiz';

const assembledActionCreators = {
  storeProject,
  storeQuizTask,
  storeSaveAndNext,
  fetchQuizTasks,
};

const mapStateToProps = state => {
  return {
    currTask: state.quiz.currTask,
    saveAndNext: state.quiz.saveAndNext,
    answer_selected: state.quiz.answer_selected
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
    runPybossaTasks(this.props.storeQuizTask,
                    this.props.storeProject,
                    this.props.storeSaveAndNext);
  }
};
