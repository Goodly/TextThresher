import React from 'react';
import 'styles/Quiz.scss';

export default React.createClass({
  displayName: 'QuizAnswer',

  propTypes: {
    answer: React.PropTypes.object.isRequired,
    isSelected: React.PropTypes.bool.isRequired,
    id: React.PropTypes.number.isRequired,
    colors: React.PropTypes.string.isRequired,
    answerClicked: React.PropTypes.func.isRequired,
    type: React.PropTypes.string.isRequired
  },

  getInitialState: function() {
    return {color: ''}
  },

  onClick: function() {
    if (this.props.type === 'radio') {
      this.setState({color: this.props.colors});
      this.props.answerClicked(this.props.id, true);
    } else {
      this.setState({color: this.props.isSelected ? ''
                                                  : this.props.colors});
      this.props.answerClicked(this.props.id, !this.props.isSelected);
    }
  },

  render() {
    var answer = this.props.answer;
    var style = {};
    if (this.props.type === 'radio' && !this.props.isSelected) {
      style = {
        backgroundColor: ''
      };
    } else {
      style = {
        backgroundColor: this.state.color
      };
    }

    return (
      <div className='quiz__answer'>
        <input onClick={this.onClick}
           type={this.props.type === 'checkbox' ? 'checkbox' : 'radio'}
           name={answer.question}
           value={answer.text}>
        </input>
        <span className='quiz__answer' style={style}>{' ' + answer.text}</span>
      </div>
    );
  }

});
