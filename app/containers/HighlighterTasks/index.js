import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { TopicHighlighter } from 'components/TopicHighlighter';

// actions
import { storeProject } from 'actions/project';
import * as articleActions from 'actions/article';
import * as topicActions from 'actions/topicPicker';
import * as highlightActions from 'actions/highlight';
import * as taskActions from 'actions/task';

// These actions are only used on MockHighlighter, to store tasks from Django
import * as highlightTaskActions from 'actions/djangoHighlights';

// Function to start MockTopicHighlighter data loading cycle
import fetchDjangoHighlights from 'django/highlight';
// Function to start loading tasks from Pybossa server
import runPybossaTasks from 'pybossa/pybossa';
// Function to fetch latest project fields instead of original task config
import { getUpdatedProject } from 'pybossa/fetchproject';

const assembledActionCreators = Object.assign(
    { storeProject },
    articleActions,
    topicActions,
    highlightActions,
    taskActions
);

// djangoHighlightTasks only used by MockHighlighter
const mapStateToProps = state => {
  return {
    article: state.article.article,
    currentTopicId: state.topicPicker.currentTopicId,
    topics: state.topicPicker.topics,
    highlights: state.highlight.highlights,
    task: state.task,
    saveAndNext: state.task.saveAndNext,
    displayState: state.task.displayState,
    djangoHighlightTasks: state.djangoHighlightTasks
  };
}

@connect (
  mapStateToProps,
  dispatch => bindActionCreators(
    Object.assign({},
                  assembledActionCreators,
                  highlightTaskActions
                 ),
    dispatch
  )
)
export class MockHighlighter extends TopicHighlighter {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    super.componentDidMount();
    fetchDjangoHighlights(this);
  }
};

@connect (
  mapStateToProps,
  dispatch => bindActionCreators(assembledActionCreators, dispatch)
)
export class RealHighlighter extends TopicHighlighter {
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
      this.props.storeTopics(task.info.topics);
      this.props.storeArticle(task.info.article);
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
