import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import Question from 'components/Question';

import { styles } from './styles.scss';

export class Quiz extends Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    taskQueue: React.PropTypes.array,
    currTask: React.PropTypes.object,
    onSaveAndNext: React.PropTypes.func
  }

  // Babel plugin transform-class-properties allows us to use
  // ES2016 property initializer syntax. So the arrow function
  // will bind 'this' of the class. (React.createClass does automatically.)
  onSaveAndNext = () => {
    this.props.saveAndNext(this.props.answers ? this.props.answers : {});
  }

  render() {
    var questionList = [];
    var topictree = this.props.currTask ? this.props.currTask.topictree : [];
    for(var i = 0; i < topictree.length; i++) {
      questionList = questionList.concat(topictree[i].questions);
    }
    return (
      <div className="quiz">
        { questionList.map((elem) => {
          return <Question question={elem} key={elem.id} />;
        }) }
        <button onClick={this.onSaveAndNext}>Save and Next</button>
      </div>
    )
  }
}
