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

function initQueue(currTask) {
  var topictree = currTask.topictree;
  var topic = [];
  for(var i = 0; i < topictree.length; i++) {
    if(topictree[i].id == currTask.topTopicId) {
      topic.unshift(topictree[i]);
    } else {
      topic.push(topictree[i]);
    }
  }
  var to_return = [];
  to_return.push(-1);
  for(var i = 0; i < topic.length; i++) {
    var questions = topic[i].questions.sort((a, b) => { return a.id - b.id; });
    var to_append = [];
    for(var i = 0; i < questions.length; i++) {
      to_append.push(questions[i].id);
    }
    to_return = to_return.concat(to_append);
  }
  return to_return;
};

const mapStateToProps = state => {
  let queue = state.quiz.queue;
  // TODO: Find a better place to do this, in an action or the reducer
  if(state.quiz.currTask && state.quiz.queue.length == 0) {
    queue = initQueue(state.quiz.currTask);
  }
  return {
    currTask: state.quiz.currTask,
    saveAndNext: state.quiz.saveAndNext,
    answer_selected: state.quiz.answer_selected,
    queue,
    question_id: state.quiz.curr_question_id
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
