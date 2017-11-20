import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Map as ImmutableMap } from 'immutable';

import { styles } from './styles.scss';

const mapStateToProps = state => {
  return {
    task: state.task.task.info,
    projectName: state.project.name,
    description: state.project.description,
  };
}

class Project extends Component {
  constructor(props) {
    super(props);
    this.getTopicNamespace = this.getTopicNamespace.bind(this);
  }

  static propTypes = {
    task: React.PropTypes.object.isRequired,
    projectName: React.PropTypes.string.isRequired,
    description: React.PropTypes.string.isRequired,
    style: React.PropTypes.object,
  }

  getTopicNamespace(currTask) {
    if (currTask.topicTree && currTask.topictree.length > 0) {
      namespace = currTask.topictree[0].namespace;
      return (
        <div className="task-metadata last">
          Question set: {namespace}
        </div>
      );
    } else {
      return <div></div>;
    };
  }

  render() {
    let currTask = this.props.task;
    let article_number = currTask.article.article_number;
    let batch_name = currTask.article.batch_name;
    let namespace = this.getTopicNamespace(currTask);
    let projectName = this.props.projectName;
    let description = this.props.description;

    return (
      <div className="progress-info" style={this.props.style}>
        <div className="task-metadata">
          Project: { projectName }
        </div>
        <div className="task-metadata">
          Desc: {description}
        </div>
        <div className="task-metadata">
          Article: {article_number}
        </div>
        { namespace }
      </div>
    );
  }
}

export default connect(mapStateToProps)(Project);
