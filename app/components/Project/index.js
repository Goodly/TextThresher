import React, { Component } from 'react';
import { connect } from 'react-redux';

import { styles } from './styles.scss';

const mapStateToProps = state => {
  return {
    name: state.project.name,
    description: state.project.description,
  };
}

class Project extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let name = this.props.name;
    let description = this.props.description;

    return (
      <div>
        <div className="project-title">
          {name}
        </div>
        <div className="project-description">
          {description}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Project);
