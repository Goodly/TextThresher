import React from 'react';

export default React.createClass({
  displayName: 'NotFoundRoute',

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
});
