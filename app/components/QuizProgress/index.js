import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map as ImmutableMap } from 'immutable';
import { QuizAnswers } from 'model/QuizAnswers';

import { styles } from './styles.scss';

const mapStateToProps = state => {
  return {
    currTask: state.quiz.currTask,
    question_db: state.quiz.db.entities.question,
    question_id: state.quiz.curr_question_id,
    queue: state.quiz.queue,
    answer_selected: state.quiz.answer_selected,
  };
}

class QuizProgress extends Component {
  constructor(props) {
    super(props);
    this.hasAllHighlights = this.hasAllHighlights.bind(this);
  }

  static propTypes = {
    currTask: PropTypes.object.isRequired,
    question_id: PropTypes.number.isRequired,
    queue: PropTypes.array.isRequired,
    question_db: PropTypes.object.isRequired,
    answer_selected: PropTypes.instanceOf(ImmutableMap).isRequired,

    answerState: PropTypes.instanceOf(QuizAnswers).isRequired,
    style: PropTypes.object,
    setActiveFn: PropTypes.func,
  }

  static defaultProps = {
    style: {},
    setActiveFn: ((question_id) => {}),
  }

  hasAllHighlights(qid) {
    let question_db = this.props.question_db;
    let answer_selected = this.props.answer_selected;
    let answerState = this.props.answerState;
    if (! answer_selected.has(qid)) {
      return false;
    };
    let answerMap = answer_selected.get(qid);
    for (let answer of answerMap.values()) {
      if (! answerState.hasAnswer(answer.answer_id)) {
        return false;
      } else {
        const annotations = answerState.getAnswerAnnotations(answer.answer_id);
        return (annotations.length > 0);
      };
    };
    return true;
  };

  render() {
    let queue = this.props.queue;
    let question_db = this.props.question_db;
    let question_id = this.props.question_id;
    let answer_selected = this.props.answer_selected;
    let outerStyle = this.props.style;

    return (
      <div className="quiz-progress-bar" style={outerStyle}>
        {
          queue.map( (qid) => {
            let style={
              color: 'white',
              paddingLeft: '4px',
              paddingRight: '4px',
              cursor: 'pointer',
              borderTop: '1px solid slategray',
              borderRight: '1px solid slategray',
              borderLeft: '1px solid slategray',
            };
            let question_number = question_db[qid].question_number;
            if (qid === question_id) {
              Object.assign(style, { borderBottom: '4px solid black' });
            } else {
              Object.assign(style, { borderBottom: '1px solid slategray' });
            };
            if ( ! answer_selected.has(qid)) {
              Object.assign(style, { backgroundColor: 'lightcoral' });
            } else {
              if (this.hasAllHighlights(qid)) {
                Object.assign(style, { backgroundColor: 'green' });
              } else {
                Object.assign(style, { backgroundColor: 'purple' });
              };
            };
            return (
              <span
                key={qid}
                style={style}
                onClick={ () => {this.props.setActiveFn(qid); }}
              >
                {question_number}
              </span>
            );
          })
        }
      </div>
    );
  }
}

export default connect(mapStateToProps)(QuizProgress);
