// Components
import QuizContext from 'components/quiz/QuizQuestion'

// React and Redux
import React, { Component } from 'react';
import ReactCSSTransitionsGroup from 'react-addons-css-transition-group';
import { connect } from 'react-redux';
import tmpQuestions from 'assets/tmpQuestions.json';

export class QuizAccordion extends Component {
	render() {
		return(
			{this.props.questions.map((question) => {
	            return (
	              <QuizQuestion 
	              	key={question.id}
	                question={question}
	                />
	            ); // NOT SURE IF STILL NEEDED AS PROP: onUpdate={this.onUpdate} 
          	})}
		)
	}
}


function mapDispatchToProps(dispatch) {
  return {
    onNewQuestion: questions => {
      dispatch(newQuestion(questions));
    }
  };
}

function mapStateToProps(state) {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(QuizAccordion);