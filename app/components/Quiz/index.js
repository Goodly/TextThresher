import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import Question from 'components/Question';

import { styles } from './styles.scss';

export class Quiz extends Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    currTask: React.PropTypes.object,
    onSaveAndNext: React.PropTypes.func,
    answer_selected: React.PropTypes.object
  }

  // Babel plugin transform-class-properties allows us to use
  // ES2016 property initializer syntax. So the arrow function
  // will bind 'this' of the class. (React.createClass does automatically.)
  onSaveAndNext = () => {
    this.props.saveAndNext(this.props.answer_selected);
  }

  mapQuestion(questions) {
    return (
      <div> 
        {questions.map((elem) => {
          return <Question question={elem} key={elem.id} />;
        })} 
      </div>);
  }

  generateSubQuestion(topic) {
    var answer_list = [];
    for(var i = 1; i < topic.length; i++) {
      var temp_answer = { id: -1 - i, answer_number: 1, answer_content: topic[i].name, next_question: null};
      answer_list.push(temp_answer);
    }
    var sub_question = {
      id: -1,
      question_number: 0,
      question_type: 'CHECKBOX',
      question_text: 'Which of these subtopics are in the highlighted text?',
      answers: answer_list
    };
    return sub_question;
  }

  mapTopic(topic) {
    var sub_question = this.generateSubQuestion(topic);

    return topic.map((elem, i) => {
      const question = i == 0 ? <Question question={sub_question} id={sub_question.id} /> : <div></div>;
      return (
        <div key={elem.id} style={{
          "border": "2px solid black",
          "padding": "15px",
          "margin": "15px"
        }}>
          <div> {elem.name} </div>
          { question }
          { this.mapQuestion(elem.questions.sort((a, b) => { return a.id - b.id; })) }
        </div>
      );
    });
  }

  mapHighlights(highlights) {
    return highlights.map((elem, i) => {
      return (
        <div key={i}>
          <div style={{ "fontWeight": "700"}}> { 'Highlight ' + i } </div>
          <div> { elem[2] } </div>
        </div>
      );
    });
  }

  render() {
    var topictree = this.props.currTask ? this.props.currTask.topictree : [];
    var new_topictree = [];
    for(var i = 0; i < topictree.length; i++) {
      if(topictree[i].id == this.props.currTask.topTopicId) {
        new_topictree.unshift(topictree[i]);
      } else {
        new_topictree.push(topictree[i]);
      }
    }

    var highlights = this.props.currTask ? this.props.currTask.highlights[0].offsets : [];

    return (
      <div className="quiz">
        <div> { this.mapHighlights(highlights) }</div> 
        { this.mapTopic(new_topictree) }
        <button onClick={this.onSaveAndNext}>Save and Next</button>
      </div>
    )
  }
}
