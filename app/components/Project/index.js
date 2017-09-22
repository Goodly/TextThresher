import React, { Component } from 'react';
import { connect } from 'react-redux';

import { styles } from './styles.scss';

const mapStateToProps = state => {
  return {
    name: state.project.name,
    description: state.project.description,
    tasksCompleted: state.task.progress.done
  };
}

class Project extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let name = this.props.name;
    let description = this.props.description;
    let tasksCompleted = this.props.tasksCompleted;
    let progress = "Welcome!"
    if (tasksCompleted === 0) {
      progress = "Welcome! Click the tutorial button to the right " +
                 "if you need to see the tuorial again.";
    } else if (tasksCompleted === 1) {
      progress = "You have completed your first task - nice!"
    } else if ((tasksCompleted > 1) && (tasksCompleted < 4)) {
      progress = "You have completed " + tasksCompleted + " tasks."
    } else if (tasksCompleted < 10) {
      progress = "You are doing well with " + tasksCompleted +
      " tasks completed. Do you think you can complete 10?";
    } else if (tasksCompleted < 20) {
      progress = "You have completed " + tasksCompleted + " tasks. Thank you!"
    } else if (tasksCompleted >= 20) {
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
}

export default connect(mapStateToProps)(Project);
