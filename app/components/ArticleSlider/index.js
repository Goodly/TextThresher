import React from 'react';
import PropTypes from 'prop-types';

export class ArticleSlider extends React.Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    article_index: PropTypes.number.isRequired,
    article_ids: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  render() {
    return (
      <input type="range"
             value={this.props.article_index}
             min={0}
             max={this.props.article_ids.length - 1}
             step={1}
             onChange={this.props.onChange}
      />
    );
  }
}
