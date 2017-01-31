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

  mapQuestion(questions) {
    return (
      <div> 
        {questions.map((elem) => {
          return <Question question={elem} key={elem.id} />;
        })} 
      </div>);
  }

  mapTopic(topic) {
    return topic.map((elem) => {
      return (
        <div key={elem.id} style={{
          "border": "2px solid black",
          "padding": "15px",
          "margin": "15px"
        }}>
          <div> {elem.name} </div>
          { this.mapQuestion(elem.questions) }
        </div>
      );
    });
  }

  render() {
    var topictree = this.props.currTask ? this.props.currTask.topictree : [];
    return (
      <div className="quiz">
        { this.mapTopic(topictree) }
        <button onClick={this.onSaveAndNext}>Save and Next</button>
      </div>
    )
  }
}
