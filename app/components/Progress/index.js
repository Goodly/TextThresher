import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Map as ImmutableMap } from 'immutable';

import { styles } from './styles.scss';

const mapStateToProps = state => {
  return {
    tasksCompleted: state.task.progress.done,
  };
}

class Progress extends Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    tasksCompleted: React.PropTypes.number.isRequired,
    style: React.PropTypes.object,
  }

  render() {
    let tasksCompleted = this.props.tasksCompleted;
    let progress = "Welcome!";
    if (tasksCompleted === 0) {
      progress = "Welcome!";
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
      <div style={this.props.style} className="project-tasks-completed">
        { progress }
      </div>
    );
  }
}

export default connect(mapStateToProps)(Progress);
