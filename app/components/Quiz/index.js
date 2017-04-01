import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import Question from 'components/Question';
import HighlightTool from 'components/HighlightTool';

import { styles } from './styles.scss';

const style = require('intro.js/introjs.css');
import { introJs } from 'intro.js/intro.js';

import { kelly_colors } from 'utils/colors';
const COLOR_OPTIONS = kelly_colors;

const EXTRA_WORDS = 12;
const re_whitespace = /\s+/;

// Given an article and a highlight string, add up to extraWords on both sides
function contextWords(article, offset, extraWords) {
  var start = offset[0];
  var end = offset[1];
  var highlighted = article.substring(start, end);
  if (highlighted.toLowerCase() != offset[2].toLowerCase()) {
    console.log("Bad offsets. Looking for '"+offset[2]+"'. Found '"+highlighted+"'");
  };
  var before = article.substring(0, start).split(re_whitespace).slice(-extraWords);
  var after = article.substring(end).split(re_whitespace, extraWords);
  return [before.join(' '), highlighted, after.join(' ')]
}

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

  componentDidMount() {
    var steps = [
      {
        'element': '.highlights',
        'intro': 'Thank you for joining the project! Before you begin, read through the text provided. Focus in particular on the bold text -- you’ll be answering questions about it later.',
        'position': 'bottom',
      },
      {
        'element': '.quiz-questions',
        'intro': 'Next, read and answer the first question presented below the text. Selecting an answer will enable the highlighting tool.',
        'position': 'left',
      },
      {
        'element': '.highlights',
        'intro': 'Please highlight all relevant words and phrases of the text that justify your answer -- make sure to include every piece of the text which support the answer you chose. When you’ve finished highlighting all relevant text to justify your answer, please check your work, then press "Next" to move onto the next question.',
        'position': 'bottom',
      },
      {
        'element': '.quiz',
        'intro': 'Repeat this process for all of the remaining questions.',
      },
      {
        'element': '.review-button',
        'intro': 'Look over all your answers and move onto the next set of questions by clicking "Review" and "Save and Next". Thank you for contributing to this project!',
      }
    ];

    var intro = introJs();
    intro.setOptions({ 'steps': steps, 'overlayOpacity': 0.5 });
    intro.start();
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
      <button type="button" className="review-button" onClick={() => { this.props.setReview(true) }}> { "Review" } </button> 
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
      <button type="button" className="review-button" onClick={() => { this.props.setReview(true) }}> { "Review" } </button> 
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
        })}
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
    var article = this.props.currTask != undefined ? this.props.currTask.article.text : '';
    for(var i = 0; i < COLOR_OPTIONS.length; i++) {
      topic.push({id: i});
    }
    for(var i = 0; i < highlights.length; i++) {
      var triplet = contextWords(article, highlights[i], EXTRA_WORDS);
      text += '...' + triplet.join(' ') + '...';
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
        <div className="highlights" style={highlighter_container}>
          <div className="quizHighlighter">
            { this.mapHighlights(highlights) }
          </div>
        </div> 

        <div className="quiz-questions" style={answer_container}>
          { question_list }
          { saveAndNextButton }
        </div>
      </div>
    )
  }
}
