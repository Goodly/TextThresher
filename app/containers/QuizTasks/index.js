import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Quiz } from 'components/Quiz';

// actions
import { storeProject } from 'actions/project';
import * as quizActions from 'actions/quiz';
import * as highlightActions from 'actions/highlight';
import * as taskActions from 'actions/task';

// These actions are only used on MockHighlighter, to store tasks from Django
import * as quizTaskActions from 'actions/djangoQuiz';

// Function to start MockQuiz data loading cycle
import fetchDjangoQuiz from 'django/quiz';
// Function to start loading tasks from Pybossa server
import runPybossaTasks from 'pybossa/pybossa';
// Function to fetch latest project fields instead of original task config
import { getUpdatedProject } from 'pybossa/fetchproject';

const assembledActionCreators = Object.assign(
  { storeProject },
  quizActions,
  highlightActions,
  taskActions
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
    review: state.quiz.review,
    djangoQuizTasks: state.djangoQuizTasks,
    highlights: state.highlight.highlights,
    task: state.task,
    saveAndNext: state.task.saveAndNext,
    displayState: state.task.displayState,
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
    this.storeTask = this.storeTask.bind(this);
    this.storeProgress = this.storeProgress.bind(this);
  }

  componentDidMount() {
    super.componentDidMount();
    runPybossaTasks(this);
    getUpdatedProject(this.props.storeProject);
  }

  storeTask(task, onSaveAndNext) {
    // super.storeTask(task, onSaveAndNext);
    if (task !== null) {
      this.props.storeTask(task, onSaveAndNext);
      this.props.storeQuizTask(task.info);
    } else {
      // Set redux to DONE mode or navigate to a DONE url
      this.props.storeTasksDone();
    };
  }

  storeProgress(data) {
    // super.storeProgress(data);
    this.props.storeProgress(data);
  }
};
