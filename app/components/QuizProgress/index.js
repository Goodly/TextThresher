import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map as ImmutableMap } from 'immutable';
import { RealQuiz } from 'containers/QuizTasks';

import { styles } from './styles.scss';

const mapStateToProps = state => {
  return {
    question_id: state.quiz.curr_question_id,
    queue: state.quiz.queue,
    question_db: state.quiz.db.entities.question,
  };
}

class QuizProgress extends Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    question_id: PropTypes.number.isRequired,
    queue: PropTypes.array.isRequired,
    question_db: PropTypes.object.isRequired,

    quizMethods: PropTypes.object.isRequired,
    style: PropTypes.object,
  }

  static defaultProps = {
    style: {},
  }

  render() {
    let queue = this.props.queue;
    let question_db = this.props.question_db;
    let question_id = this.props.question_id;

    let quizMethods = this.props.quizMethods;
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
            if (qid === question_id) {
              Object.assign(style, {
                borderTop: '4px solid black',
                borderBottom: '4px solid black'
              });
            } else {
              Object.assign(style, {
                borderTop: '1px solid slategray',
                borderBottom: '1px solid slategray'
              });
            };
            if ( ! quizMethods.questionInProgress(qid)) {
              Object.assign(style, { backgroundColor: 'lightcoral' });
            } else {
              if (quizMethods.questionStatusGreen(qid)) {
                Object.assign(style, { backgroundColor: 'green' });
              } else {
                Object.assign(style, { backgroundColor: 'purple' });
              };
            };
            let question_number = question_db[qid].question_number;
            return (
              <span
                key={qid}
                style={style}
                onClick={ () => {quizMethods.props.activeQuestion(qid); }}
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
