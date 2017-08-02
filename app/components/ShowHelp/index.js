import React, { Component } from 'react';
import { connect } from 'react-redux';
import { markdown } from 'markdown';

import { styles } from './styles.scss';

const mapStateToProps = state => {
  return {
    name: state.project.name,
    description: state.project.description,
    long_description: state.project.long_description,
  };
}

class ShowHelp extends Component {
  render() {
    let name = this.props.name;
    let description = this.props.description;
    let long_description = this.props.long_description;
    let help_content = {
      __html: markdown.toHTML(long_description)
    };

    return (
      <div className="display-help">
        <button onClick={ () => { this.props.closeHelp(); } } className='close-help-top'>
          Close Help
        </button>
        <h1 className="project-title">
          {name}
        </h1>
        <h4 className="project-description">
          {description}
        </h4>
        <div className="help-contents" dangerouslySetInnerHTML={help_content}>
        </div>
        <button onClick={ () => { this.props.closeHelp(); } } className='close-help-bottom'>
          Close Help
        </button>
      </div>
    );
  }
}

ShowHelp.propTypes = { closeHelp: React.PropTypes.func.isRequired };

export default connect(mapStateToProps)(ShowHelp);
