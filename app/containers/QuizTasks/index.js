import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Quiz } from 'components/Quiz';
import { storeProject } from 'actions/project';
import * as quizActions from 'actions/quiz';

// Actions for MockQuiz
import { fetchQuizTasks } from 'actions/quizTasks';
// API for RealQuiz
import runPybossaTasks from 'pybossa/quiz';

const assembledActionCreators = Object.assign(
  { storeProject },
  { fetchQuizTasks },
  quizActions,
);

const mapStateToProps = state => {
  return {
    currTask: state.quiz.currTask,
    queue: state.quiz.queue,
    question_id: state.quiz.curr_question_id,
    answer_selected: state.quiz.answer_selected,
    saveAndNext: state.quiz.saveAndNext,
    review: state.quiz.review,
    color_id: state.quiz.highlighter_color
  }
};

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
