import React from 'react';

export default React.createClass({
  displayName: 'QuizContext',

  propTypes: {
    context: React.PropTypes.object.isRequired
  },

  render() {
    var text = this.props.context.text;
    var highlights = this.props.context.highlights;

    var start = 0;
    var tail = '';
    var l = highlights.length;

    if (highlights[l - 1][1] !== text.length) {
      tail = <span>{text.substring(highlights[l - 1][1], text.length)}</span>;
    }

    return (
      <p className='quiz__context'>
        {highlights.map((n) => {
          // I'd rather not have to wrap these like this... is there a better way?
          var markup = (
            <span>
              <span>{text.substring(start, n[0])}</span>
              <span className='highlighted'>{text.substring(n[0], n[1])}</span>
            </span>
          );
          start = n[1];
          return markup;
        })}
        { tail }
      </p>
    );
  }

});
