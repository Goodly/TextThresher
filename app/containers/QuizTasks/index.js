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
    db: state.quiz.db,
    abridged: state.quiz.abridged,
    queue: state.quiz.queue,
    question_id: state.quiz.curr_question_id,
    answer_id: state.quiz.curr_answer_id,
    answer_selected: state.quiz.answer_selected,
    answer_colors: state.quiz.answer_colors,
    saveAndNext: state.quiz.saveAndNext,
    review: state.quiz.review,
    djangoQuizTasks: state.djangoQuizTasks,
    done: state.quiz.done,
    highlights: state.highlight.highlights,
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
    super.componentDidMount();
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
