import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Quiz } from 'components/Quiz';

// actions
import { storeProject } from 'actions/project';
import * as quizActions from 'actions/quiz';
import * as taskActions from 'actions/task';

// Function to start loading tasks from Pybossa server
import runPybossaTasks from 'pybossa/pybossa';
// Function to fetch latest project fields instead of original task config
import { getUpdatedProject } from 'pybossa/fetchproject';

const assembledActionCreators = Object.assign(
  { storeProject },
  quizActions,
  taskActions
);

const mapStateToProps = state => {
  return {
    currTask: state.quiz.currTask,
    db: state.quiz.db,
    queue: state.quiz.queue,
    question_id: state.quiz.curr_question_id,
    answer_id: state.quiz.curr_answer_id,
    answer_selected: state.quiz.answer_selected,
    answer_colors: state.quiz.answer_colors,
    saveAndNext: state.task.saveAndNext,
    displayState: state.task.displayState,
    displayHintSelectControl: state.task.displayHintSelectControl,
    displayHintType: state.task.displayHintType,
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
      this.props.activeQuestion(this.props.question_id);
      this.loadEditorState(task.info);
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
