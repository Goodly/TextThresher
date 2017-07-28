import React from 'react';
import { connect } from 'react-redux';

import { styles } from './styles.scss';

const mapStateToProps = state => {
  return {
    name: state.project.name,
    description: state.project.description,
    tasksCompleted: state.task.progress.done
  };
}

const Project = React.createClass({
  displayName: 'Project',
  render() {
    let name = this.props.name;
    let description = this.props.description;
    let tasksCompleted = this.props.tasksCompleted;
    let progress = "You have not completed any tasks for this project yet.";
    if ((tasksCompleted > 0) && (tasksCompleted < 4)) {
      progress = "You have completed " + tasksCompleted + " tasks."
    } else if (tasksCompleted < 10) {
      progress = "You are getting the hang of this with " + tasksCompleted +
      " tasks completed. Do you think you can do 10?";
    } else if (tasksCompleted < 20) {
      progress = "You have completed " + tasksCompleted + " tasks. Thank you!"
    } else {
      progress = "You are awesome! You have completed " + tasksCompleted +
      " tasks. Thank you very much for helping out so much!";
    }

    return (
      <div>
        <div className="project-tasks-completed">
          { progress }
        </div>
        <h1 className="project-title">
          {name}
        </h1>
        <h4 className="project-description">
          {description}
        </h4>
      </div>
    );
  }
});

export default connect(mapStateToProps)(Project);
