import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Map as ImmutableMap } from 'immutable';
import moment from 'moment';

import { styles } from './styles.scss';

const mapStateToProps = state => {
  return {
    info: state.task.task.info,
    created: state.task.task.created,
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
    info: React.PropTypes.object.isRequired,
    created: React.PropTypes.string.isRequired,
    projectName: React.PropTypes.string.isRequired,
    description: React.PropTypes.string.isRequired,
    style: React.PropTypes.object,
  }

  getTopicNamespace(currTask) {
    if (currTask.topictree && currTask.topictree.length > 0) {
      let namespace = currTask.topictree[0].namespace;
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
    let currTask = this.props.info;
    let article_number = currTask.article.article_number;
    let batch_name = currTask.article.batch_name;
    let namespace = this.getTopicNamespace(currTask);
    let projectName = this.props.projectName;
    let description = this.props.description;
    let createdDate = (moment(this.props.created)
                       .format('LLL [UTC]'));

    return (
      <div className="progress-info" style={this.props.style}>
        <div className="task-metadata">
          Project: { projectName }
        </div>
        <div className="task-metadata">
          Project uploaded: { createdDate }
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
