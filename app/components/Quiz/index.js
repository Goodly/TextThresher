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
    answer_selected: React.PropTypes.object,
    queue: React.PropTypes.array
  }

  // Babel plugin transform-class-properties allows us to use
  // ES2016 property initializer syntax. So the arrow function
  // will bind 'this' of the class. (React.createClass does automatically.)
  onSaveAndNext = () => {
    this.props.saveAndNext(this.props.answer_selected);
  }

  dispQuestion(question) { 
    var next_id = question.id;
    var prev_id = -1;
    for(var k = 0; k < this.props.queue.length; k++) {
      if(question.id == this.props.queue[k]) {
        if(k < this.props.queue.length - 1) {
          next_id = this.props.queue[k + 1];
        }
        if(k > 0) {
          prev_id = this.props.queue[k - 1];
        }
        break;
      }
    } 
    return (
      <div key={question.id}>
        <Question question={question} /> 
        <button type="button" onClick={() => { this.props.activeQuestion(prev_id) }}> { "Prev" }</button>
        <button type="button" onClick={() => { this.props.activeQuestion(next_id) }}>{ "Next" }</button>
      </div>
    );
  }

  generateSubQuestion(topic) {
    var answer_list = [];
    for(var i = 1; i < topic.length; i++) {
      var temp_answer = { id: -1 - i, answer_number: 1, answer_content: topic[i].name, next_question: topic[i].id};
      answer_list.push(temp_answer);
    }
    var sub_question = {
      id: -1,
      question_number: 0,
      question_type: 'SELECT_SUBTOPIC',
      question_text: 'Which of these subtopics are in the highlighted text?',
      answers: answer_list
    };
    return sub_question;
  }

  mapTopic(topic) {
    var sub_question = this.generateSubQuestion(topic);
    var last_question = this.props.question_id == this.props.queue[this.props.queue.length - 1];
    var last_button = last_question ? <button type="button"> { "Review" } </button> : <div></div>;

    var next_id = this.props.queue.length > 1 ? this.props.queue[1] : -1;
    var format_question = (
      <div key={-1}>
        <Question question={sub_question} />
        <button type="button" onClick={() => { this.props.activeQuestion(-1)}}> { "Prev" }</button>
        <button type="button" onClick={() => { this.props.activeQuestion(next_id)}}> { "Next" } </button>
        { last_button }
      </div>
    );  
    if(this.props.question_id == -1) {
      return format_question;
    }

    for(var i = 0; i < topic.length; i++) {
      for(var k = 0; k < topic[i].questions.length; k++) {
        if(this.props.question_id == topic[i].questions[k].id) {
          return (
            <div key={topic[i].id} style={{
              "border": "2px solid black",
              "padding": "15px",
              "margin": "15px"
            }}>
              <div> {topic[i].name} </div>
              { this.dispQuestion(topic[i].questions[k]) }
              { last_button }
            </div>
          );
        }
      }
    }
    console.log("there was some error with the question queue processing");
    return <div></div>;
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
        <button onClick={() => { this.onSaveAndNext(); window.scrollTo(0, 0) }}>Save and Next</button>
      </div>
    )
  }
}
