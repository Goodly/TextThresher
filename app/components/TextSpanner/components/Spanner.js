import React from 'react';

let debug = require('debug')('thresher:TextSpanner');

export class Spanner extends React.Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}
