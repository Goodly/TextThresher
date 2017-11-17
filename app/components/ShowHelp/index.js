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

  parseVideoUrl(long_description) {
    var links = [];
    var lines = long_description.split(/\r\n?|\n/)
    var found = false;
    var links_start = long_description.length;
    var ch_count = 0;
    for (var i = 0; i < lines.length; i++) {
      if (found && lines[i]) {
        var start = lines[i].indexOf("|") + 1;
        var text = lines[i].substring(0, start - 1).trim();
        var url = lines[i].substring(start, lines[i].length).trim();
        if (url.substring(0, 4) != 'http') {
          url = 'http://' + url;
        }
        links.push([text, url]);
      }
      if (lines[i] === "+++options+++") {
        found = true;
        links_start = ch_count;
      }
      ch_count = ch_count + lines[i].length + 1;
    }
    return [links, links_start];
  }

  render() {
    let name = this.props.name;
    let description = this.props.description;
    let long_description = this.props.long_description;
    // Find the help video URL
    var parsed = this.parseVideoUrl(long_description);
    var links = parsed[0];
    var links_start = parsed[1];
    long_description = long_description.substring(0, links_start + 1);

    console.log(links);
    console.log(links_start);
    console.log(long_description);

    var links_html;
    var markup;
    if (links) {
      links_html = links.map((link, index) =>
                    <div key={index}>
                      <a href={link[1]}>{link[0]}</a>
                    </div>);
      markup = <div>{links_html}</div>;
    } else {
      markup = <div></div>;
    }

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
        {markup}
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
