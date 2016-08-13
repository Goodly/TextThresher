import React, { Component } from 'react';
import { nextQuestion } from 'actions/quiz'

export class QuizQuestion extends Component {
	render() {
		return (
			<div>
				{this.props.question.text}
				{this.props.question.answerStuff}
				<button>NEXT</button>
			</div>
		); // TODO flesh out this stuff
	}
}

function mapDispatchToProps(dispatch) {
  return {
    newQuestion: () => {
      dispatch(newQuestion(this.props.activeQuestion));
    }
  };
}

function mapStateToProps(state) {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(QuizQuestion);