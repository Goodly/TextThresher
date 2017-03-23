import { TopicHighlighter } from 'components/TopicHighlighter';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as articleActionCreators from 'actions/article';
import * as topicsActionCreators from 'actions/topicPicker';
import * as projectActionCreators from 'actions/project';
import * as highlightActionCreators from 'actions/highlight';

// Actions for MockTopicHighlighter
import * as taskActionCreators from 'actions/highlightTasks';
// API for RealTopicHighlighter
import runPybossaTasks from 'pybossa/highlight';

const assembledActionCreators = Object.assign(
    {},
    articleActionCreators,
    topicsActionCreators,
    projectActionCreators,
    highlightActionCreators,
    taskActionCreators
);

const mapStateToProps = state => {
  return {
    article: state.article.article,
    saveAndNext: state.article.saveAndNext,
    currentTopicId: state.topicPicker.currentTopicId,
    topics: state.topicPicker.topics,
    highlights: state.highlight.highlights
  };
}

@connect (
  mapStateToProps,
  dispatch => bindActionCreators(assembledActionCreators, dispatch)
)
export class MockHighlighter extends TopicHighlighter {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    super.componentDidMount();
    this.props.fetchHighlightTasks();
  }
};

@connect (
  mapStateToProps,
  dispatch => bindActionCreators(assembledActionCreators, dispatch)
)
export class RealHighlighter extends TopicHighlighter {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    super.componentDidMount();
    runPybossaTasks(this.props.storeArticle,
                    this.props.storeProject,
                    this.props.storeTopics,
                    this.props.storeSaveAndNext);
  }
};
