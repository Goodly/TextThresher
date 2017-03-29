import React from 'react';
import { connect } from 'react-redux';

import { SingleDatePicker } from 'react-dates';
import moment from 'moment';
import { answerSelected, answerRemoved, colorSelected,
         updateQueue, removeElemQueue } from '../../actions/quiz';


/* component styles */
import { styles } from './styles.scss';
import 'react-dates/lib/css/_datepicker.css';

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

const TYPES = {
  RADIO: 'RADIO',
  CHECKBOX: 'CHECKBOX',
  DATETIME: 'DATETIME',
  TEXT: 'TEXT',
  TIME: 'TIME',
  SELECT_SUBTOPIC: 'SELECT_SUBTOPIC'
};

const mapStateToProps = state => {
  var answers = {};
  var color = {};
  var currTask = {};
  if(state.quiz) {
    answers = state.quiz.answer_selected;
    color = state.quiz.highlighter_color;
    currTask = state.quiz.currTask;
  }
  return {
    answers,
    color,
    currTask
  };
}

const mapDispatchToProps = dispatch => {
  return {
    selectAnswer: (type, q_id, a_id, text) => {
      dispatch(answerSelected(type, q_id, a_id, text))
    },
    removeAnswer: (type, q_id, a_id) => {
      dispatch(answerRemoved(type, q_id, a_id))
    },
    setColor: (q_id, a_id, color, c_id) => {
      dispatch(colorSelected(q_id, a_id, color, c_id))
    },
    queueUpdate: (questions, type) => {
      dispatch(updateQueue(questions, type))
    },
    queueRemove: (questions) => {
      dispatch(removeElemQueue(questions))
    }
  };
}

const Question = React.createClass({
  displayname: 'Question',

  getInitialState () {
    return {
      date: moment(),
      focused: false
    };
  },

  propTypes: {
    question: React.PropTypes.object.isRequired,
  },

  checkInArray: function(elem) {
    var answer_list = this.props.answers[this.props.question.id];
    answer_list = answer_list ? answer_list: [];
    for(var i = 0; i < answer_list.length; i++) {
      if(answer_list[i].answer_id == elem) {
        return true;
      }
    }
    return false;
  },

  mapToRadio: function(arr, controlname="controlgroup") {
    return (
      <form>
        { arr.map((elem, i) => 
          {
            var colorText = this.checkInArray(elem.id) ? COLOR_OPTIONS[i] : '';
            var style = { "display": "inline-block", 
              "borderRadius": 15,
              "width": 30, 
              "height": 30, 
              "backgroundColor": COLOR_OPTIONS[i] };
            if(this.props.color && this.props.color.answer_id == elem.id) {
              style["border"] = "2px solid black";
            } 
            return (
              <div key={elem.id}
                style={{ "color": colorText }}>
                <div style={ style } 
                    onClick={() => { if(colorText) { this.props.setColor(this.props.question.id, elem.id, COLOR_OPTIONS[i], i) }}} />
                <input type="radio" name={controlname} checked={ this.checkInArray(elem.id) }
                  onChange={ () => { this.radioOnClick(elem, i) }} />
                { " " + elem.answer_content }
                { /* <span style={{ "fontSize": "80%", "color": "red" }}> { elem.next_question } </span> */ }
              </div>
            );
          }) 
        }
      </form>
    );
  },

  findNextQuestions: function(answer) {
    var next_id = answer.next_questions;
    var next_question = [];
    for(var i = 0; i < next_id.length; i++) {
      for(var j = 0; j < this.props.currTask.topictree.length; j++) {
        var temp = this.props.currTask.topictree[j];
        for(var k = 0; k < temp.questions.length; k++) {
          if(temp.questions[k].id == next_id[i]) {
            next_question.push(temp.questions[k]);
            break;
          }
        }
      }
    }
    return next_question;
  },

  radioOnClick: function(answer, color_id) {
    if(this.checkInArray(answer.id)) {
      this.props.queueRemove(this.findNextQuestions(answer));
    } else {
      this.props.queueUpdate(answer.next_questions, TYPES.RADIO);
    }
    this.props.setColor(this.props.question.id, answer.id, COLOR_OPTIONS[color_id], color_id);
    this.props.selectAnswer(TYPES.RADIO, this.props.question.id, answer.id, answer.text);
  },

  mapToCheckbox: function(arr, type, controlname="controlgroup") {
    return (
      <form>
        { arr.map((elem, i) => {
          let colorText = this.checkInArray(elem.id) ? COLOR_OPTIONS[i] : '';
          var style = { "display": "inline-block", 
            "width": 30, 
            "height": 30, 
            "backgroundColor": COLOR_OPTIONS[i], 
            "verticalAlign": "middle",
            "marginRight": 5,
            "borderRadius": 15 };
          if(this.props.color && this.props.color.answer_id == elem.id) {
            style["border"] = "2px solid black";
          } 
          return (
            <div key={elem.id}
              style={{ "color": colorText, "margin": 10 }}>
              <div style={ style } 
                  onClick={() => { if(colorText) { this.props.setColor(this.props.question.id, elem.id, COLOR_OPTIONS[i], i) }}} />
              <span style={{ "verticalAlign": "middle" }}>
                <input type="checkbox" 
                    name={controlname}
                    checked={ this.checkInArray(elem.id) }
                    onChange={ () => { this.checkboxOnClick(type, elem, i) }} />
                { " " + elem.answer_content }
                { /* <span style={{ "fontSize": "80%", "color": "red" }}> { elem.next_question } </span> */ }
              </span>
            </div>
          );
        })}
      </form>
    );
  },

  checkboxOnClick: function(type, answer, color_id) {
    var next_topic = {};
    var color = COLOR_OPTIONS[color_id];
    for(var i = 0; i < this.props.currTask.topictree.length; i++) {
      var temp = this.props.currTask.topictree[i];
      if(temp.id == answer.next_question) {
        next_topic = temp;
        break;
      }
    }
    if(this.checkInArray(answer.id)) {
      this.props.removeAnswer(TYPES.CHECKBOX, this.props.question.id, answer.id);
      if(this.props.color && this.props.color.answer_id == answer.id) {
        this.props.setColor(-1, -1, '', -1);
      }
      if(type = TYPES.SELECT_SUBTOPIC) {
        this.props.queueRemove(next_topic.questions);
      } else {
        this.props.queueRemove(this.findNextQuestions(answer));
      }
    } else {
      this.props.setColor(this.props.question.id, answer.id, color, color_id);
      this.props.selectAnswer(TYPES.CHECKBOX, this.props.question.id, answer.id, answer.answer_content);
      if(type == TYPES.SELECT_SUBTOPIC) {
        this.props.queueUpdate(next_topic.questions, TYPES.SELECT_SUBTOPIC);
      } else {
        this.props.queueUpdate(answer.next_questions, TYPES.CHECKBOX);
      }
    }
  },

  dateTimeInput: function() {
    var colorText = COLOR_OPTIONS[0];
    return (
      <form>
        <SingleDatePicker
          id={ this.props.question.id.toString() }
          isOutsideRange={ () => {} }
          date={this.state.date}
          focused={this.state.focused}
          onDateChange={(date) => { this.setState({ date }); this.props.selectAnswer(TYPES.DATETIME, this.props.question.id, 0, date); }}
          onFocusChange={({ focused }) => { this.setState({ focused }); }} />
      </form>
    );
  },

  textInput: function(type, controlname="textinput") {
    var colorText = COLOR_OPTIONS[0];
    var str = this.props.answers[this.props.question.id] ? this.props.answers[this.props.question.id][0].text : '';
    return (
      <form>
        <input type="text" name={controlname} style={{ color: colorText }}
            value={str}
            onChange={(event) => { this.props.selectAnswer(type, this.props.question.id, 0, event.target.value) } }/>
      </form>
    );
  },

  mapQuestionAnswers: function() {
    if(this.props.question.id == 1) {
      return this.mapToCheckbox(this.props.question.answers);
    } else if(this.props.question.id == 2) {
      return this.dateTimeInput();
    }
    var answer_list = this.props.question.answers.sort((a, b) => { return a.id - b.id; });
    switch (this.props.question.question_type) {
      case TYPES.RADIO:
        return this.mapToRadio(answer_list)
      case TYPES.CHECKBOX:
        return this.mapToCheckbox(answer_list, TYPES.CHECKBOX)
      case TYPES.SELECT_SUBTOPIC:
        return this.mapToCheckbox(answer_list, TYPES.SELECT_SUBTOPIC)
      case TYPES.DATETIME:
        return this.dateTimeInput();
      case TYPES.TEXT:
        return this.textInput(TYPES.TEXT);
      case TYPES.TIME:
        return this.textInput(TYPES.TIME);
      default:
        console.log('unsupported answer type: ' + this.props.question.question_type + ', should be: RADIO, CHECKBOX, DATETIME or TEXT');
        return <div></div>
    }
  },

  render() {
    // TODO: use actual question type fetched from the backend
    const mapped_answers = this.props.question ? this.mapQuestionAnswers() :  <div></div> ;
    return (
      <div className={`${styles}`}>
        <span style={{"paddingRight": 10}}> {this.props.question.question_number} </span>
        { /* <span style={{ "fontSize": "80%", "color": "red" }}> { this.props.question.id } </span> */ }
        {this.props.question.question_text}
        { mapped_answers }
      </div>
    );
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Question);
