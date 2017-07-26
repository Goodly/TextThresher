import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { TopicHighlighter } from 'components/TopicHighlighter';

// actions
import { storeProject } from 'actions/project';
import * as articleActions from 'actions/article';
import * as topicActions from 'actions/topicPicker';
import * as highlightActions from 'actions/highlight';

// These actions are only used on MockHighlighter, to store tasks from Django
import * as highlightTaskActions from 'actions/djangoHighlights';

// Function to start MockTopicHighlighter data loading cycle
import fetchDjangoHighlights from 'django/highlight';
// Function to start loading tasks from Pybossa server
import runPybossaTasks from 'pybossa/pybossa';

const assembledActionCreators = Object.assign(
    { storeProject },
    articleActions,
    topicActions,
    highlightActions
);

// djangoHighlightTasks only used by MockHighlighter
const mapStateToProps = state => {
  return {
    article: state.article.article,
    saveAndNext: state.article.saveAndNext,
    currentTopicId: state.topicPicker.currentTopicId,
    topics: state.topicPicker.topics,
    highlights: state.highlight.highlights,
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
  }

  storeTask(task, onSaveAndNext) {
    super.storeTask(task, onSaveAndNext);
    if (task !== null) {
      this.props.storeProject(task.info.project);
      this.props.storeTopics(task.info.topics);
      this.props.storeArticle(task.info.article);
      this.props.storeSaveAndNext(onSaveAndNext);
    } else {
        // Set redux to DONE mode or navigate to a DONE url
    };
  }

  storeProgress(data) {
    super.storeProgress(data);
  }
};
