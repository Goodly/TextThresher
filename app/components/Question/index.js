import React from 'react';
import { connect } from 'react-redux';

import { Map as ImmutableMap } from 'immutable';

import { SingleDatePicker } from 'react-dates';
import moment from 'moment';
import { selectAnswer, removeAnswer } from 'actions/quiz';

import { styles } from './styles.scss';
import 'react-dates/lib/css/_datepicker.css';

const TYPES = {
  RADIO: 'RADIO',
  CHECKBOX: 'CHECKBOX',
  TEXT: 'TEXT',
  DATE: 'DATE',
  TIME: 'TIME',
  SELECT_SUBTOPIC: 'SELECT_SUBTOPIC'
};

const mapStateToProps = state => {
  return {
    answer_id: state.quiz.curr_answer_id,
    answers: state.quiz.answer_selected,
    answer_colors: state.quiz.answer_colors,
    currTask: state.quiz.currTask
  };
}

const mapDispatchToProps = dispatch => {
  return {
    selectAnswer: (type, q_id, a_id, text) => {
      dispatch(selectAnswer(type, q_id, a_id, text))
    },
    removeAnswer: (type, q_id, a_id) => {
      dispatch(removeAnswer(type, q_id, a_id))
    },
  };
}

function renderInkWell(color, selected, clickHandler) {
  var style = {
    "display": "inline-block",
    "borderRadius": 15,
    "width": 30,
    "height": 30,
    "marginRight": 5,
    "verticalAlign": "middle",
    "backgroundColor": color
  };
  if (color !=='' && selected) {
    style["border"] = "2px solid black";
  };
  return <div style={ style } onClick={ clickHandler } />
}

const Question = React.createClass({
  displayname: 'Question',

  getInitialState () {
    return {
      focused: false
    };
  },

  propTypes: {
    question: React.PropTypes.object.isRequired,
    answer_id: React.PropTypes.number,
    answers: React.PropTypes.instanceOf(ImmutableMap).isRequired,
    answer_colors: React.PropTypes.instanceOf(ImmutableMap).isRequired,
    currTask: React.PropTypes.object
  },

  activeAnswer: function(answer_id) {
    for (const answered_qs of this.props.answers.values()) {
      if (answered_qs.has(answer_id)) {
        return true;
      };
    };
    return false;
  },

  getAnswerValue: function(answer_id, default_value) {
    for (const answered_qs of this.props.answers.values()) {
      if (answered_qs.has(answer_id)) {
        return answered_qs.get(answer_id).text;
      };
    };
    return default_value;
  },

  getAnswerColorState: function(answer_id) {
    let answerColor = '';
    let selected = false;
    // answer_colors is a Map
    if (this.props.answer_colors.has(answer_id)) {
      answerColor = this.props.answer_colors.get(answer_id);
    };
    if (this.props.answer_id === answer_id) {
      selected = true;
    };
    return { answerColor, selected };
  },

  mapToRadio: function(answer_list, controlname="controlgroup") {
    return (
      <form>
        { answer_list.map((answer, i) =>
          {
            let { answerColor, selected } = this.getAnswerColorState(answer.id);
            var clickHandler = () => {
              this.props.selectAnswer(TYPES.RADIO, this.props.question.id,
                                      answer.id, answer.answer_content);
            };
            return (
              <div key={answer.id}
                style={{ "color": answerColor }}>
                { renderInkWell(answerColor, selected, clickHandler) }
                <span style={{ "verticalAlign": "middle" }}>
                  <input type="radio" name={controlname} checked={ this.activeAnswer(answer.id) }
                    onChange={clickHandler}
                  />
                  { " " + answer.answer_content }
                </span>
              </div>
            );
          }
        )}
      </form>
    );
  },

  mapToCheckbox: function(answer_list, type, controlname="controlgroup") {
    return (
      <form>
        { answer_list.map((answer, i) => {
          // Don't show color well if question is SELECT_SUBTOPIC or answer is not selected
          let { answerColor, selected } = this.getAnswerColorState(answer.id);
          if (type === TYPES.SELECT_SUBTOPIC || !this.activeAnswer(answer.id)) {
            answerColor = '';
            selected = false;
          };
          const clickHandler = () => {
            this.props.selectAnswer(TYPES.CHECKBOX, this.props.question.id,
                                    answer.id, answer.answer_content);
          };
          const checkboxHandler = () => {
            if (this.activeAnswer(answer.id)) {
              this.props.removeAnswer(TYPES.CHECKBOX, this.props.question.id,
                                      answer.id);
            } else {
              this.props.selectAnswer(TYPES.CHECKBOX, this.props.question.id,
                                      answer.id, answer.answer_content);
            }
          };
          return (
            <div key={answer.id}
              style={{ "color": answerColor }}>
              { renderInkWell(answerColor, selected, clickHandler) }
              <span style={{ "verticalAlign": "middle" }}>
                <input type="checkbox"
                  name={controlname}
                  checked={this.activeAnswer(answer.id)}
                  onChange={checkboxHandler}
                />
                { " " + answer.answer_content }
              </span>
            </div>
          );
        })}
      </form>
    );
  },

  textInput: function(answer_list, type, controlname="textinput") {
    const answer = answer_list[0];
    const answer_text = this.getAnswerValue(answer.id, '');
    let { answerColor, selected } = this.getAnswerColorState(answer.id);
    const clickHandler = () => {
      this.props.selectAnswer(type, this.props.question.id, answer.id, answer_text);
    };
    const changeHandler = (event) => {
      this.props.selectAnswer(type, this.props.question.id, answer.id, event.target.value);
    };
    return (
      <form>
        { renderInkWell(answerColor, selected, clickHandler) }
        <input type="text" name={controlname}
          value={answer_text}
          onChange={changeHandler}
        />
      </form>
    );
  },

  dateInput: function(answer_list) {
    const answer = answer_list[0];
    // reducer/quiz.js activeQuestion sets the default in Question at a time
    // mode. If the user skips straight to Review, this default will be used.
    const defaultDate = moment().startOf('date').toISOString();
    const answer_text = this.getAnswerValue(answer.id, defaultDate);
    let { answerColor, selected } = this.getAnswerColorState(answer.id);
    const clickHandler = () => {
      this.props.selectAnswer(TYPES.DATE, this.props.question.id, answer.id, answer_text);
    };
    const dateChangeHandler = (date) => {
      const answer_text = date.toISOString();
      this.props.selectAnswer(TYPES.DATE, this.props.question.id, answer.id, answer_text);
    };
    return (
      <form>
        { renderInkWell(answerColor, selected, clickHandler) }
        <SingleDatePicker
          id={ this.props.question.id.toString() }
          isOutsideRange={ (day) => false }
          date={moment(answer_text)}
          initialVisibleMonth={() => moment(answer_text)}
          focused={this.state.focused}
          onDateChange={dateChangeHandler}
          onFocusChange={({ focused }) => { this.setState({ focused }); }}
        />
      </form>
    );
  },

  mapQuestionAnswers: function() {
    var answer_list = this.props.question.answers.sort((a, b) => {
      return a.answer_number - b.answer_number;
    });
    switch (this.props.question.question_type) {
      case TYPES.RADIO:
        return this.mapToRadio(answer_list)
      case TYPES.CHECKBOX:
        return this.mapToCheckbox(answer_list, TYPES.CHECKBOX)
      case TYPES.TEXT:
        return this.textInput(answer_list, TYPES.TEXT);
      case TYPES.DATE:
        return this.dateInput(answer_list);
      case TYPES.TIME:
        return this.textInput(answer_list, TYPES.TIME);
      case TYPES.SELECT_SUBTOPIC:
        return this.mapToCheckbox(answer_list, TYPES.SELECT_SUBTOPIC)
      default:
        console.log('Unsupported answer type: ' + this.props.question.question_type +
                    ', should be: RADIO, CHECKBOX, TEXT, DATE, TIME, or SELECT_SUBTOPIC.');
        return <div></div>
    }
  },

  render() {
    const mapped_answers = this.props.question ? this.mapQuestionAnswers() :  <div></div> ;
    const question_number = this.props.question.question_number;
    const question_label = question_number > 0 ? (String(question_number)+'.') : '';
    return (
      <div className={`${styles}`}>
        <span style={{"paddingRight": 10}}> {question_label}</span>
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
