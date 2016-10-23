import React from 'react';
import { connect } from 'react-redux';
import { SingleDatePicker } from 'react-dates';
import { answerSelected, colorSelected } from '../../actions/quiz';

/* component styles */
import { styles } from './styles.scss';

const COLOR_OPTIONS = ['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00',
          '#ffff33','#a65628','#f781bf','#999999','#8dd3c7',
          '#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462',
          '#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5',
          '#ffed6f'];

const mapStateToProps = state => {
  return {
    question: state.quiz.question,
    answers: state.quiz.answer_selected
  };
}

const mapDispatchToProps = dispatch => {
  return {
    selectAnswer: (id, text, checked) => {
      dispatch(answerSelected(id, text, checked))
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

  mapToRadio: function(arr) {
    return (
      <form>
        { arr.map((elem, i) => 
          {
            var colorText = elem.answer_id == this.props.answers.id ? COLOR_OPTIONS[i] : '';
            return (
              <div key={elem.id}
                onChange={() => { this.props.selectAnswer(elem.answer_id, '', {}) }}
                style={{ "color": colorText }}>
                <input type="radio" name="question" /> 
                { " " + elem.answer_content }
              </div>
            );
          }) 
        }
        <input type="submit" value="Next" />
      </form>
    );
  },

  mapToCheckbox: function(arr) {
  return (
      <form>
        { arr.map((elem, i) => {
          let colorText = this.props.answers.checked[elem.answer_id] ? COLOR_OPTIONS[i] : '';
          let checked = Object.assign({}, this.props.answers.checked);
          return (
            <div key={elem.id}
              style={{ "color": colorText }}>
              <div style={{ "display": "inline-block", 
                  "width": 30, 
                  "height": 30, 
                  "backgroundColor": COLOR_OPTIONS[i] }} 
                  onClick={() => { this.props.setColor(COLOR_OPTIONS[i]) }} />
              <input type="checkbox" 
                  name="question" 
                  checked={ this.props.answers.checked[elem.answer_id] ? true : false }
                  onChange={ () => { this.checkboxOnClick(checked, elem.answer_id) }} /> 
              { " " + elem.answer_content }
            </div>
          );
        })}
        <input type="submit" value="Next" />
      </form>
    );
  },

  checkboxOnClick: function(dict, ans_id) {
    if(!(ans_id in dict)) {
      dict[ans_id] = false;
    }
    dict[ans_id] = !dict[ans_id];
    this.props.selectAnswer(ans_id, '', dict);
  },

  dateTimeInput: function() {
    // TODO: once backend finalized, get only one answer ID from input (or none)
    let answer_id = this.props.question.answers[0].answer_id;
    var colorText = this.props.answers[answer_id] ? COLOR_OPTIONS[0] : '';
    return (
      <form>
        <SingleDatePicker id={ this.props.question.question_id.toString() }/>
        <input type="submit" value="Next" />
      </form>
    );
  },

  textInput: function() {
    // TODO: once backend finalized, get only one answer ID from input (or none)
    let answer_id = this.props.question.answers[0].answer_id;
    const colorText = this.props.answers.id == answer_id ? COLOR_OPTIONS[0] : '';
    return (
      <form>
        <input type="text" name="question" style={{ color: colorText }}
            onChange={(event) => { this.props.selectAnswer(answer_id, event.target.value, {}) } }/>
        <input type="submit" value="Next" />
      </form>
    );
  },

  mapQuestionAnswers: function() {
    switch (this.props.question.type) {
      case 'radio':
        return this.mapToRadio(this.props.question.answers)
      case 'checkbox':
        return this.mapToCheckbox(this.props.question.answers)
      case 'datetime':
        return this.dateTimeInput();
      case 'input':
        return this.textInput();
      default:
        console.log('unprovided answer type, should be: radio, input, checkbox, or datetime');
        return <div></div>
    }
  },

  render() {
    // TODO: use actual question type fetched from the backend
    this.props.question.type = 'checkbox';

    const mapped_answers = this.props.question.isFetching ? <div></div> : this.mapQuestionAnswers();
    return (
      <div className={`${styles}`}>
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
