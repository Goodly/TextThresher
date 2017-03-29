import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import Question from 'components/Question';
import HighlightTool from 'components/HighlightTool';

import { styles } from './styles.scss';

const COLOR_OPTIONS = [
  'rgb(241,96,97)',
  'rgb(253,212,132)',
  'rgb(175,215,146)',
  'rgb(168,210,191)',
  'rgb(255,153,000)',
  'rgb(102,000,153)',
  'rgb(000,153,153)',
  'rgb(255,102,255)',
  'rgb(000,051,153)',
  'rgb(153,000,204)',
  'rgb(70,194,64)',
  'rgb(94,242,188)'
];


export class Quiz extends Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    currTask: React.PropTypes.object,
    onSaveAndNext: React.PropTypes.func,
    answer_selected: React.PropTypes.object,
    queue: React.PropTypes.array,
    review: React.PropTypes.bool,
    color_id: React.PropTypes.object
  }

  // Babel plugin transform-class-properties allows us to use
  // ES2016 property initializer syntax. So the arrow function
  // will bind 'this' of the class. (React.createClass does automatically.)
  onSaveAndNext = () => {
    window.scrollTo(0, 0) 
    this.props.saveAndNext(this.props.answer_selected);
    this.props.setReview(false);
    this.props.clearAnswers();
    this.props.colorSelected();
    this.props.clearHighlights();
  }

  dispQuestion(question, showButton) { 
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
    var button = showButton ?  
      <div>
        <button type="button" onClick={() => { this.props.activeQuestion(prev_id) }}> { "Prev" }</button>
        <button type="button" onClick={() => { this.props.activeQuestion(next_id) }}>{ "Next" }</button>
      </div>
      : <div></div>;
    return (
      <div key={question.id}>
        <Question question={question} /> 
        { button }
      </div>
    );
  }

  generateSubQuestion(topic, showButton) {
    var answer_list = [];
    for(var i = 0; i < topic.length; i++) {
      if(topic[i].id != this.props.currTask.topTopicId) {
        var temp_answer = { id: -2 - i, answer_number: 1, answer_content: topic[i].name, next_question: topic[i].id};
        answer_list.push(temp_answer);
      }
    }
    var sub_question = {
      id: -1,
      question_number: 0,
      question_type: 'SELECT_SUBTOPIC',
      question_text: 'Which of these subtopics are in the highlighted text?',
      answers: answer_list
    };
    var next_id = this.props.queue.length > 1 ? this.props.queue[1] : -1;
    var last_question = this.props.question_id == this.props.queue[this.props.queue.length - 1];
    var button = showButton ? 
      <div>
        <button type="button" onClick={() => {this.props.activeQuestion(-1)}}> { "Prev" }</button>
        <button type="button" onClick={() => {this.props.activeQuestion(next_id)}}> {"Next"} </button>
      </div>
      : <div></div>;
    var last_button = last_question && showButton ? 
      <button type="button" onClick={() => { this.props.setReview(true) }}> { "Review" } </button> 
      : <div></div>;
    return (
      <div key={-1}>
        <Question question={sub_question} />
        { button }
        { last_button }
      </div>
    );
  }

  selectQuestion() {
    var topic = this.props.currTask ? this.props.currTask.topictree : [];
    var last_question = this.props.question_id == this.props.queue[this.props.queue.length - 1];
    var last_button = last_question ? 
      <button type="button" onClick={() => { this.props.setReview(true) }}> { "Review" } </button> 
      : <div></div>;

    if(this.props.question_id == -1) {
      return this.generateSubQuestion(topic, true);
    }

    for(var i = 0; i < topic.length; i++) {
      for(var k = 0; k < topic[i].questions.length; k++) {
        if(this.props.question_id == topic[i].questions[k].id) {
          return (
            <div key={topic[i].id}>
              { this.dispQuestion(topic[i].questions[k], true) }
              { last_button }
            </div>
          );
        }
      }
    }
    console.log("there was some error with the question queue processing");
    return <div></div>;
  }

  mapQuestions(questions) {
    return (
      <div>
        {questions.map((elem, i) => {
          for(var j = 0; j < this.props.queue.length; j++) {
            if(elem.id == this.props.queue[j]) {
              return this.dispQuestion(elem, false);
              break;
            }
          }
        })
      }
      </div>
    );
  }

  dispReview() {
    return this.props.currTask.topictree.map((elem, i) => {
      var question = i == 0 ? this.generateSubQuestion(this.props.currTask.topictree, false) : <div></div>;
        return (<div key={elem.id} style={{
          "border": "2px solid black",
          "padding": "15px",
          "margin": "15px"
        }}>
          <div> {elem.name} </div>
          { question }
          { this.mapQuestions(elem.questions) }
        </div>);
    });
  }

  mapHighlights(highlights) {
    var topic = [];
    var text = '';
    for(var i = 0; i < COLOR_OPTIONS.length; i++) {
      topic.push({id: i});
    }
    for(var i = 0; i < highlights.length; i++) {
      text += '...' + highlights[i][2] + '...';
    }
    var c_id = this.props.color_id.color_id != undefined ? this.props.color_id.color_id : -1;
    console.log(c_id);
    return (
      <HighlightTool text={text} colors={COLOR_OPTIONS} topics={topic} currentTopicId={c_id}/>
    );
  }

  render() {

    var highlights = this.props.currTask ? this.props.currTask.highlights[0].offsets : [];
    var question_list = this.props.review ? this.dispReview() : this.selectQuestion();

    var saveAndNextButton = this.props.review ? <button onClick={ this.onSaveAndNext }>Save and Next</button> : <div></div>;
    var highlighter_container = {
      "position": "fixed",
      "left": "15px",
      "width": "450px",
    };
    var answer_container = {
      "marginLeft": "450px",
      "paddingLeft": "15px"
    }

    return (
      <div className="quiz clearfix" >
        <div style={highlighter_container}> 
          <div> { this.mapHighlights(highlights) }</div> 
        </div> 

        <div style={answer_container}>
          { question_list }
          { saveAndNextButton }
        </div>
      </div>
    )
  }
}
