import React from 'react';
import { connect } from 'react-redux';

import { SingleDatePicker } from 'react-dates';
import { answerSelected, answerRemoved, colorSelected } from '../../actions/quiz';

/* component styles */
import { styles } from './styles.scss';

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
  if(state.quiz) {
    answers = state.quiz.answer_selected;
  }
  return {
    answers
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
    setColor: (color) => {
      dispatch(colorSelected(color))
    } 
  };
}

const Question = React.createClass({
  displayname: 'Question',

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
            return (
              <div key={elem.id}
                onChange={() => { this.props.selectAnswer(TYPES.RADIO, this.props.question.id, elem.id, '') }}
                style={{ "color": colorText }}>
                <div style={{ "display": "inline-block", 
                    "width": 30, 
                    "height": 30, 
                    "backgroundColor": COLOR_OPTIONS[i] }} 
                    onClick={() => { this.props.setColor(COLOR_OPTIONS[i]) }} />
                <input type="radio" name={controlname} />
                { " " + elem.answer_content }
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
          return (
            <div key={elem.id}
              style={{ "color": colorText }}>
              <div style={{ "display": "inline-block", 
                  "width": 30, 
                  "height": 30, 
                  "backgroundColor": COLOR_OPTIONS[i] }} 
                  onClick={() => { this.props.setColor(COLOR_OPTIONS[i]) }} />
              <input type="checkbox" 
                  name={controlname}
                  checked={ this.checkInArray(elem.id) }
                  onChange={ () => { this.checkboxOnClick(elem.id) }} />
              { " " + elem.answer_content }
            </div>
          );
        })}
      </form>
    );
  },

  checkboxOnClick: function(ans_id) {
    if(this.checkInArray(ans_id)) {
      this.props.removeAnswer(TYPES.CHECKBOX, this.props.question.id, ans_id);
    } else {
      this.props.selectAnswer(TYPES.CHECKBOX, this.props.question.id, ans_id, '');
    }
  },

  dateTimeInput: function() {
    var colorText = COLOR_OPTIONS[0];
    return (
      <form>
        <SingleDatePicker id={ this.props.question.id.toString() }/>
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
      return this.dateTimeInput();
    }
    switch (this.props.question.question_type) {
      case TYPES.RADIO:
        return this.mapToRadio(this.props.question.answers)
      case TYPES.CHECKBOX:
        return this.mapToCheckbox(this.props.question.answers)
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
