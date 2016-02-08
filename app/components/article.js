import React from 'react';

export default React.createClass({
  displayName: 'Article',

  propTypes: {
    article: React.PropTypes.object.isRequired
  },

  render() {
    let article = this.props.article;

    return (
      <div className='article'>{article.text}</div>
    );
  }

});
