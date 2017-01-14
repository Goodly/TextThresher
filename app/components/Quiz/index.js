import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import Question from 'components/Question';

import { styles } from './styles.scss';

export class Quiz extends Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    question: React.PropTypes.object,
    onSaveAndNext: React.PropTypes.func
  }

  // Babel plugin transform-class-properties allows us to use
  // ES2016 property initializer syntax. So the arrow function
  // will bind 'this' of the class. (React.createClass does automatically.)
  onSaveAndNext = () => {
    this.props.saveAndNext(this.props.answers ? this.props.answers : {});
  }

  render() {
    return (
      <div className="quiz">
        <Question question={this.props.question}/>
        <button onClick={this.onSaveAndNext}>Save and Next</button>
      </div>
    )
  }
}
