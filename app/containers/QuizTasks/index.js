import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Quiz } from 'components/Quiz';

// actions
import { storeProject } from 'actions/project';
import * as quizActions from 'actions/quiz';
import * as highlightActions from 'actions/highlight';

// These actions are only used on MockHighlighter, to store tasks from Django
import * as quizTaskActions from 'actions/djangoQuiz';

// Function to start MockQuiz data loading cycle
import fetchDjangoQuiz from 'django/quiz';
// Function to start RealQuiz data loading cycle
import fetchPybossaQuiz from 'pybossa/quiz';

const assembledActionCreators = Object.assign(
  { storeProject },
  quizActions,
  highlightActions
);

// djangoQuizTasks only used by MockHighlighter
const mapStateToProps = state => {
  return {
    currTask: state.quiz.currTask,
    queue: state.quiz.queue,
    question_id: state.quiz.curr_question_id,
    answer_selected: state.quiz.answer_selected,
    saveAndNext: state.quiz.saveAndNext,
    review: state.quiz.review,
    color_id: state.quiz.highlighter_color,
    djangoQuizTasks: state.djangoQuizTasks
  }
};

@connect (
  mapStateToProps,
  dispatch => bindActionCreators(
    Object.assign({},
                  assembledActionCreators,
                  quizTaskActions
                 ),
    dispatch)
)
export class MockQuiz extends Quiz {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    fetchDjangoQuiz(this);
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
    fetchPybossaQuiz(this);
  }
};
