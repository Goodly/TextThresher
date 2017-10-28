import React from 'react';
import PropTypes from 'prop-types';

function appendIfExists(metadata, fieldOrder) {
  let sequence = [];
  for (let field of fieldOrder) {
    if (field.name in metadata
        && metadata[field.name] !== null
        && metadata[field.name] !== undefined) {
      if (field.label !== '') {
        sequence.push(field.label + ": " + metadata[field.name]);
      } else {;
        sequence.push(metadata[field.name]);
      };
    };
  };
  return sequence.join(', ');;
}

export class ArticleMetaData extends React.Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    metadata: PropTypes.object.isRequired,
  }

  render() {
    let metadata = this.props.metadata;

    let fieldOrder = [
      {name: 'article_number', label: 'Article'},
      {name: 'periodical', label: ''},
      {name: 'periodical_code', label: 'Periodical code'},
      {name: 'city',  label: ''},
      {name: 'state', label: ''},
      {name: 'date_published', label: 'Published'},
      {name: 'version', label: 'version'},
    ];
    let elements = [];
    let citation = appendIfExists(metadata, fieldOrder);
    if (citation !== '') {
      elements.push(
        <div key='1' className="article-citation">
          {citation}
        </div>
      );
    };

    // Only Deciding Force articles have annotators in their metadata.
    if ('annotators' in metadata) {
      let annotators = metadata['annotators'].join(' ');
      if (annotators !== '') {
        elements.push(
          <div key='2' className="article-annotator">
            Annotators: {annotators}
          </div>
        );
      };
    };

    fieldOrder = [{name: 'filename', label: 'Filename'}];
    let filename = appendIfExists(metadata, fieldOrder);
    if (filename !== '') {
      elements.push(
        <div key='3' className="article-filename">
          {filename}
        </div>
      );
    };
    return (
      <div>
        {elements}
      </div>
    );
  }
}
