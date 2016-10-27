import React from 'react';
import { connect } from 'react-redux';
import 'text-highlighter/src/TextHighlighter';

import { styles } from './styles.scss';

import * as projectActionCreators from 'actions/project';

const mapStateToProps = state => {
  return {
    name: state.project.name,
    instructions: state.project.instructions
  };
}

const Project = React.createClass({
    displayName: 'Project',
    render() {
        var name = this.props.name;
        var instructions = this.props.instructions;

        return (
            <div>
                <h1 className="project_title">
                    {name}
                </h1>
                <h4 className="project_instruction">
                    {instructions}
                </h4>
            </div>
        );
    }

});


export default connect(mapStateToProps)(Project);