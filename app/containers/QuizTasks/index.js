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
}

const mapStateToProps = state => {
  var taskQueue = null;
  var currTask = null;
  if(state.quizTasks.taskDatabase.entities && state.quizTasks.taskDatabase.result && state.quizTasks.taskQueue) {
    taskQueue = state.quizTasks.taskQueue;
    var taskNum = state.quizTasks.taskDatabase.result[0];
    currTask = state.quizTasks.taskDatabase.entities.tasks[taskNum];
  }
  var queue = state.quiz.queue;
  if(currTask && state.quiz.queue.length == 0) {
    queue = initQueue(currTask);
  }
  return {
    saveAndNext: state.quiz.saveAndNext,
    taskQueue,
    currTask,
    queue,
    question_id: state.quiz.curr_question_id
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
