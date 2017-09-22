import React, { Component } from 'react';

export default class NotFoundRoute extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='item'>
        <div className='404-message canvas-text'>
          <h1>
            Something went wrong...
          </h1>
        </div>
      </div>
    );
  }
}
