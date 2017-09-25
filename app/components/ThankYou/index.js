import React, { Component } from 'react';
import { connect } from 'react-redux';

import { styles } from './styles.scss';

const mapStateToProps = state => {
  return {
    name: state.project.name,
    short_name: state.project.short_name,
    tasksCompleted: state.task.progress.done
  };
}

class ThankYou extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const name = this.props.name;
    const tasksCompleted = this.props.tasksCompleted;
    const projectLink = "/project/" + this.props.short_name;
    const blogLink = projectLink + "/blog";

    let message = "You have completed the task for ";
    if (tasksCompleted > 1) {
      message = "You have completed all " + tasksCompleted + " tasks for ";
    };

    return (
      <div className="thank-you">
        { message }
        <a href={ projectLink } className="project-title"> { name } </a>!
        <div>
         Thank you! We appreciate your assistance.
        </div>
        <div className="thank-you-suggestion">
          You can check <a href={ blogLink }>{ name } blog</a> to find
          updates and results for this project.
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(ThankYou);
