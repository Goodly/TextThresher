import React from 'react';
import { connect } from 'react-redux';

import { styles } from './styles.scss';

const mapStateToProps = state => {
  return {
    name: state.project.name,
    tasksCompleted: state.task.progress.done
  };
}

const ThankYou = React.createClass({
  displayName: 'Project',
  render() {
    let name = this.props.name;
    let tasksCompleted = this.props.tasksCompleted;

    return (
      <div>
        Thank you! You have completed all 
        <span className="project-tasks-completed"> { tasksCompleted } </span>
        tasks for
        <span className="project-title"> {name} </span>!
        <div>
          We appreciate your assistance.
        </div>
      </div>
    );
  }
});

export default connect(mapStateToProps)(ThankYou);
