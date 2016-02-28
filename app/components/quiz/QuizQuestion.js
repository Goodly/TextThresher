import React from 'react';
import QuizAnswer from 'components/quiz/QuizAnswer.js';
import QuizContext from 'components/quiz/QuizContext.js';
import randomPalette from 'utils/palette';

export default React.createClass({
  displayName: 'QuizQuestion',

  propTypes: {
    question: React.PropTypes.object.isRequired,
    onUpdate: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    var isSelected = new Array(this.props.question.answers.length).fill(false);
    var randomColors = this.props.question.type === 'checkbox'
      ? randomPalette(this.props.question.answers.length)
      : randomPalette(1);
    return {colors: randomColors, isSelectedFlags: isSelected};
  },

  answerClicked: function(id, selected) {
    // from child, which id of answer was clicked.
    var isSelectedFlags = this.state.isSelectedFlags;
    if (this.props.question.type === 'checkbox') {
      // if it is a checkbox, it should update ONLY the required ID flag, leave others
      isSelectedFlags[id] = selected;
      this.setState({isSelectedFlags});
    } else {
      // if it is a radio, it should set ALL others to false, only this id flag to true
      isSelectedFlags = Array(isSelectedFlags.length).fill(false);
      isSelectedFlags[id] = selected;
      this.setState({isSelectedFlags});
    }
    this.props.onUpdate(this.props.question.id, isSelectedFlags.includes(true));
  },

  render() {
    return (
      <div className='quiz__question'>
        <QuizContext context={this.props.question.context}/>
        <br/>
        <p>{this.props.question.text}</p>
        <form>
          {this.props.question.answers.map((answer, i) => {
            var isSelected = this.state.isSelectedFlags[i]
            var color = this.props.question.type === 'checkbox'
              ? this.state.colors[i]
              : this.state.colors[0];
            return (
              <QuizAnswer key={answer.text}
                          answer={answer}
                          isSelected={isSelected}
                          id={i}
                          colors={color}
                          answerClicked={this.answerClicked}
                          type={this.props.question.type}/>
            );
          })}
        </form>
      </div>
    );
  }

});
