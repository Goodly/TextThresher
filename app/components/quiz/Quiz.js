// Components
import QuizContext from 'components/quiz/QuizContext'
// import HighlightModule from 
import QuizAccordion from 'components/quiz/QuizAccordion'
// import TopicInfo from 'components/quiz/TopicInfo'

// React and Redux
import React, { Component } from 'react';
import ReactCSSTransitionsGroup from 'react-addons-css-transition-group';
import { connect } from 'react-redux';
import tmpQuestions from 'assets/tmpQuestions.json';

export class Quiz extends Component {
    render() {
        return(
            <div>
                <QuizContext context={this.props.curContext} />
                <QuizAccordion />
            </div>
        );
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
  return { questions: state.quizReducers.questions };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Quiz);