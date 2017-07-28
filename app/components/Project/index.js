import React from 'react';
import { connect } from 'react-redux';

import { styles } from './styles.scss';

const mapStateToProps = state => {
  return {
    name: state.project.name,
    description: state.project.description
  };
}

const Project = React.createClass({
  displayName: 'Project',
  render() {
    var name = this.props.name;
    var description = this.props.description;

    return (
      <div>
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
