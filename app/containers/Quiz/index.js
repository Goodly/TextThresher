import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as quizActionCreators from 'actions/quiz';

const assembledActionCreators = Object.assign({}, quizActionCreators);

import Question from 'components/Question';

import {styles} from './styles.scss';

const mapStateToProps = state => {
  return {
    question: state.quiz.question
  };
}

@connect (
  mapStateToProps,
  dispatch => bindActionCreators(assembledActionCreators, dispatch)
)

export class Quiz extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount(){

  }
  render() {
    return (
      <div><Question question={this.props.question}/></div>
    )
  }
}
