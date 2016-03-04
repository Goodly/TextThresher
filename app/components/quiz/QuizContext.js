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
        {Array(highlights.length * 2).fill().map((_,i) => {
          var curHL = highlights[i / 2 | 0];
          if (i % 2 === 0) {
            // render normal text
            return (<span key={i}>{text.substring(start, curHL[0])}</span>);
          } else {
            // render highlight
            start = curHL[1];
            return (<span key={i} className='highlighted'>{text.substring(curHL[0], curHL[1])}</span>);
          }
        })}
        { tail }
      </p>
    );
  }

});
