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
  constructor(props) {
    super(props);
  }

  static propTypes = {
    closeHelp: React.PropTypes.func.isRequired
  }

  render() {
    let name = this.props.name;
    let description = this.props.description;
    let long_description = this.props.long_description;
    // Find the help video URL
    var url = '';
    if (long_description.substring(0, 10) === "++++++++++") {
      // Find the ending syntax
      var i = 10;
      var found = false;
      while (i < long_description.length) {
        if (long_description.substring(i, i+1) === "+") {
          if (long_description.substring(i, i+10) === "++++++++++") {
            found = true;
            break;
          }
        }
        i += 1;
      }
      if (found == true) {
        url = long_description.substring(10, i).trim();
        if (url.substring(0, 4) != 'http') {
          url = 'http://' + url;
        }
        long_description = long_description.substring(i+10, long_description.length);
      }
    }

    console.log(url);

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
        <div className="video-link">
          <a href={url}>Video Tutorial</a>
        </div>
        <div className="help-contents" dangerouslySetInnerHTML={help_content}>
        </div>
        <button onClick={ () => { this.props.closeHelp(); } } className='close-help-bottom'>
          Close Help
        </button>
      </div>
    );
  }
}

export default connect(mapStateToProps)(ShowHelp);
