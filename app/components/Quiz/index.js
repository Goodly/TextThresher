import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { Map as ImmutableMap } from 'immutable';

import Question from 'components/Question';
import HighlightTool from 'components/HighlightTool';

import { styles } from './styles.scss';

const style = require('intro.js/introjs.css');
import { introJs } from 'intro.js/intro.js';

import { getAnnotatedText, getAnswerAnnotations } from 'components/Quiz/contextWords';

function makeHighlightDB(highlights) {
  let highlightDB = new Map();
  for (const entry of highlights) {
    const answer_id = entry.topic;
    if (highlightDB.has(answer_id)) {
      highlightDB.get(answer_id).push(entry);
    } else {
      highlightDB.set(answer_id, [entry]);
    };
  };
  return highlightDB;
};

function saveQuizAnswers(queue, answer_selected, highlights, questionDB) {
  const highlightDB = makeHighlightDB(highlights);
  let savedQuiz = [];
  queue.forEach( (question_id) => {
    if (answer_selected.has(question_id)) {
      let answerMap = answer_selected.get(question_id);
      let answersWithHighlights = [];
      for (let answer of answerMap.values()) {
        if (highlightDB.has(answer.answer_id)) {
          answer['highlights'] = highlightDB.get(answer.answer_id);
        } else {
          answer['highlights'] = [];
        };
        savedQuiz.push(answer);
      }
    } else if (questionDB[question_id].question_type !== "CHECKBOX" &&
               questionDB[question_id].question_type !== "SELECT_SUBTOPIC") {
      throw new Error("You must answer all the questions before saving.");
    };
  });
  return savedQuiz;
};

export class Quiz extends Component {
  constructor(props) {
    super(props);
    
    this.handleScroll = this.handleScroll.bind(this);
    this.state = {
      highlightsStyle: 'highlights-fixed',
    };
  }

  static propTypes = {
    currTask: React.PropTypes.object,
    db: React.PropTypes.object,
    abridged: React.PropTypes.string,
    hints_offsets: React.PropTypes.array,
    queue: React.PropTypes.array,
    question_id: React.PropTypes.number,
    answer_id: React.PropTypes.number,
    answer_selected: React.PropTypes.instanceOf(ImmutableMap).isRequired,
    answer_colors: React.PropTypes.instanceOf(ImmutableMap).isRequired,
    saveAndNext: React.PropTypes.func,
    review: React.PropTypes.bool,
    done: React.PropTypes.bool,
    highlights: React.PropTypes.array.isRequired,
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
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

  allQuestionsAnswered = () => {
    const queue = this.props.queue;
    const answer_selected = this.props.answer_selected;
    const questionDB = this.props.db.entities.question;
    // Every question must have an answer, except checkboxes
    return queue.every( (question_id) =>
      answer_selected.has(question_id) ||
      questionDB[question_id].question_type === "CHECKBOX" ||
      questionDB[question_id].question_type === "SELECT_SUBTOPIC");
  };

  // Babel plugin transform-class-properties allows us to use
  // ES2016 property initializer syntax. So the arrow function
  // will bind 'this' of the class. (React.createClass does automatically.)
  onSaveAndNext = () => {
    window.scrollTo(0, 0) 
    const queue = this.props.queue;
    const answer_selected = this.props.answer_selected;
    const highlights = this.props.highlights;
    const questionDB = this.props.db.entities.question;
    const savedAnswers = saveQuizAnswers(queue, answer_selected, highlights, questionDB);
    const article_text = this.props.currTask != undefined ? this.props.currTask.article.text : '';
    const savedQuiz = {
      article_text,
      abridged_text: this.props.abridged,
      abridged_highlights: this.props.hints_offsets,
      savedAnswers,
    };
    this.props.clearAnswers();
    this.props.clearHighlights();
    this.props.saveAndNext(savedQuiz);
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
    var next_button = next_id == question.id ? <div></div> :
        <button type="button" onClick={() => { this.props.activeQuestion(next_id); }}>{ "Next" }</button>;
    var button = showButton ?  
      <div>
        <button type="button" onClick={() => { this.props.activeQuestion(prev_id); }}> { "Prev" }</button>
        { next_button }
      </div>
      : <div></div>;
    return (
      <div key={question.id}>
        <Question question={question} /> 
        { button }
      </div>
    );
  }

  selectQuestion() {
    var topic = this.props.currTask ? this.props.currTask.topictree : [];
    var last_question = this.props.question_id == this.props.queue[this.props.queue.length - 1];
    var last_button = last_question ? 
      <button type="button" className="review-button" onClick={() => { this.props.setReview(true); }}> { "Review" } </button> 
      : <div></div>;

    var rootTopicName = '';
    for(var i = 0; i < topic.length; i++) {
      // Topics are sorted by their "order" field in ascending order.
      // The root topic is imported as order 0. So we're going to find
      // it first before any subtopic.
      if (this.props.currTask.topTopicId === topic[i].id) {
        rootTopicName = topic[i].name + ':';
      };
      for(var k = 0; k < topic[i].questions.length; k++) {
        if(this.props.question_id == topic[i].questions[k].id) {
          if (this.props.currTask.topTopicId === topic[i].id) {
            rootTopicName = ''; // Don't show root topic and topic when the same
          };
          return (
            <div key={topic[i].id}>
              <div style={{fontSize: '80%', color:'rgb(64,64,64)', marginBottom:'10px'}}>
                {rootTopicName} {topic[i].name}
              </div>
              { this.dispQuestion(topic[i].questions[k], true) }
              { last_button }
            </div>
          );
        }
      }
    }
    console.log("Did not find the question with id:"+String(this.props.question_id));
    return <div></div>;
  }

  mapQuestions(questions) {
    return (
      <div>
        {questions.map((question, i) => {
          for(var j = 0; j < this.props.queue.length; j++) {
            if (question.id == this.props.queue[j]) {
              return this.dispQuestion(question, false);
              break;
            }
          }
        })}
      </div>
    );
  }

  dispReview() {
    return this.props.currTask.topictree.map((topic, i) => {
        return (<div key={topic.id} style={{
          "border": "2px solid black",
          "padding": "15px",
          "margin": "15px"
        }}>
          <div> {topic.name} </div>
          { this.mapQuestions(topic.questions) }
        </div>);
    });
  }

  displayHighlighter(topic_highlights) {
    const article_text = this.props.currTask != undefined ? this.props.currTask.article.text : '';
    const hint_sets_for_article = this.props.currTask != undefined ? this.props.currTask.hints : [];
    // TODO: retrieve hint_type from the question record.
    const hint_type = 'WHERE'; // data.nlp_hint_types.py: 'WHO', 'HOW MANY', 'WHEN', 'NONE'
    const { abridged, hints_offsets } = getAnnotatedText(article_text,
                                                   topic_highlights,
                                                   hint_type,
                                                   hint_sets_for_article);
    const { color_array, answer_ids } = getAnswerAnnotations(this.props.answer_colors);

    return (
      <HighlightTool text={abridged}
                     colors={color_array}
                     topics={answer_ids}
                     currentTopicId={this.props.answer_id}
                     hints_offsets={hints_offsets}
      />
    );
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll() {
    let navbar = document.querySelector('.navbar');
    let footer = document.querySelector('footer');
    let highlights = document.querySelector('.highlights');
    let getRect = (el) => el.getBoundingClientRect();
    let footerTop = getRect(footer).top;

    // Check if topic picker should start scrolling
    if (footerTop - 1 < getRect(highlights).bottom) {
      this.setState({ highlightsStyle: 'highlights-absolute'});
    };
    // Check if topic picker should stop scrolling
    if (getRect(highlights).top > getRect(navbar).height) {
      this.setState({ highlightsStyle: 'highlights-fixed'});
    };
  }

  render() {
    if(this.props.done) {
      return <div>Thank you for contributing to the project!</div>
    }

    var topic_highlights = this.props.currTask ? this.props.currTask.highlights[0].offsets : [];
    var question_list = this.props.review ? this.dispReview() : this.selectQuestion();

    let saveAndNextButton =  <div/>;
    if (this.props.review && this.allQuestionsAnswered()) {
      saveAndNextButton =  <button onClick={ this.onSaveAndNext }>
                             Save and Next
                           </button>;
    };
    // var highlighter_container = {
    //   "position": "fixed",
    //   "left": "15px",
    //   "width": "450px",
    // };
    var answer_container = {
      "marginLeft": "450px",
      "paddingLeft": "15px"
    }

    return (
      <div className="quiz clearfix" >
        <div className={`highlights ${this.state.highlightsStyle}`}>
          <div className="quizHighlighter">
            { this.displayHighlighter(topic_highlights) }
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
