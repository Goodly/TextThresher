import React from 'react';
import { connect } from 'react-redux';

import { SingleDatePicker } from 'react-dates';
import moment from 'moment';
import { answerSelected, answerRemoved, colorSelected } from '../../actions/quiz';

/* component styles */
import { styles } from './styles.scss';
import 'react-dates/lib/css/_datepicker.css';

const COLOR_OPTIONS = ['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00',
          '#ffff33','#a65628','#f781bf','#999999','#8dd3c7',
          '#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462',
          '#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5',
          '#ffed6f'];

const TYPES = {
  RADIO: 'RADIO',
  CHECKBOX: 'CHECKBOX',
  DATETIME: 'DATETIME',
  TEXT: 'TEXT'
};

const mapStateToProps = state => {
  var answers = {};
  var color = {};
  if(state.quiz) {
    answers = state.quiz.answer_selected;
    color = state.quiz.highlighter_color;
  }
  return {
    answers,
    color
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
    setColor: (q_id, a_id, color) => {
      dispatch(colorSelected(q_id, a_id, color))
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

  radioOnClick: function(ans_id, text, color) {
    this.props.setColor(this.props.question.id, ans_id, color);
    this.props.selectAnswer(TYPES.RADIO, this.props.question.id, ans_id, text);
  },

  mapToRadio: function(arr, controlname="controlgroup") {
    return (
      <form>
        { arr.map((elem, i) => 
          {
            var colorText = this.checkInArray(elem.id) ? COLOR_OPTIONS[i] : '';
            var style = { "display": "inline-block", "width": 30, "height": 30, "backgroundColor": COLOR_OPTIONS[i] };
            if(this.props.color && this.props.color.answer_id == elem.id) {
              style["border"] = "2px solid black";
            } 
            return (
              <div key={elem.id}
                style={{ "color": colorText }}>
                <div style={ style } 
                    onClick={() => { if(colorText) { this.props.setColor(this.props.question.id, elem.id, COLOR_OPTIONS[i]) }}} />
                <input type="radio" name={controlname} 
                  onChange={ () => { this.radioOnClick(elem.id, elem.answer_content, COLOR_OPTIONS[i]) }} />
                { " " + elem.answer_content }
                <span style={{ "fontSize": "80%", "color": "red" }}> { elem.next_question } </span>
              </div>
            );
          }) 
        }
      </form>
    );
  },

  mapToCheckbox: function(arr, controlname="controlgroup") {
    return (
      <form>
        { arr.map((elem, i) => {
          let colorText = this.checkInArray(elem.id) ? COLOR_OPTIONS[i] : '';
          var style = { "display": "inline-block", "width": 30, "height": 30, "backgroundColor": COLOR_OPTIONS[i] };
          if(this.props.color && this.props.color.answer_id == elem.id) {
            style["border"] = "2px solid black";
          } 
          return (
            <div key={elem.id}
              style={{ "color": colorText }}>
              <div style={ style } 
                  onClick={() => { if(colorText) { this.props.setColor(this.props.question.id, elem.id, COLOR_OPTIONS[i]) }}} />
              <input type="checkbox" 
                  name={controlname}
                  checked={ this.checkInArray(elem.id) }
                  onChange={ () => { this.checkboxOnClick(elem.id, elem.answer_content, COLOR_OPTIONS[i]) }} />
              { " " + elem.answer_content }
              <span style={{ "fontSize": "80%", "color": "red" }}> { elem.next_question } </span>
            </div>
          );
        })}
      </form>
    );
  },

  checkboxOnClick: function(ans_id, text, color) {
    if(this.checkInArray(ans_id)) {
      this.props.removeAnswer(TYPES.CHECKBOX, this.props.question.id, ans_id);
      if(this.props.color && this.props.color.answer_id == ans_id) {
        this.props.setColor(-1, -1, '');
      }
    } else {
      this.props.setColor(this.props.question.id, ans_id, color);
      this.props.selectAnswer(TYPES.CHECKBOX, this.props.question.id, ans_id, text);
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

  textInput: function(controlname="textinput") {
    var colorText = COLOR_OPTIONS[0];
    var str = this.props.answers[this.props.question.id] ? this.props.answers[this.props.question.id][0].text : '';
    return (
      <form>
        <input type="text" name={controlname} style={{ color: colorText }}
            value={str}
            onChange={(event) => { this.props.selectAnswer(TYPES.TEXT, this.props.question.id, 0, event.target.value) } }/>
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
        return this.mapToCheckbox(answer_list)
      case TYPES.DATETIME:
        return this.dateTimeInput();
      case TYPES.TEXT:
        return this.textInput();
      default:
        console.log('unsupported answer type, should be: RADIO, CHECKBOX, DATETIME or TEXT');
        return <div></div>
    }
  },

  render() {
    // TODO: use actual question type fetched from the backend
    const mapped_answers = this.props.question ? this.mapQuestionAnswers() :  <div></div> ;
    return (
      <div className={`${styles}`}>
        <div> {this.props.question.question_number} </div>
        <span style={{ "fontSize": "80%", "color": "red" }}> { this.props.question.id } </span>
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
