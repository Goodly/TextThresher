import React from 'react';
import PropTypes from 'prop-types';

export class Slider extends React.Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    index: PropTypes.number.isRequired,
    values: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
  }

  static defaultProps = {
    style: {},
  }

  render() {
    return (
      <input type="range"
             value={this.props.index}
             min={0}
             max={this.props.values.length - 1}
             step={1}
             onChange={this.props.onChange}
             style={this.props.style}
      />
    );
  }
}
