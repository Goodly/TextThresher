import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { Map as ImmutableMap } from 'immutable';

import Question from 'components/Question';
import HighlightTool from 'components/HighlightTool';
import Project from 'components/Project';
import ThankYou from 'components/ThankYou';
import ShowHelp from 'components/ShowHelp';
import { displayStates } from 'components/displaystates';

import { styles } from './styles.scss';

const style = require('intro.js/introjs.css');
import { introJs } from 'intro.js/intro.js';

import { abridgeText,
         getAnswerAnnotations } from 'components/Quiz/contextWords';

// note, will also capture 'whom' and 'whose'
const re_hinttype = /^(WHERE|WHO|HOW MANY|WHEN)/i;

function inferHintType(question_text) {
  // data.nlp_hint_types.py: 'WHERE', 'WHO', 'HOW MANY', 'WHEN', 'NONE'
  let match = question_text.match(re_hinttype);
  if (match) {
    return match[1].toUpperCase();
  };
  return 'NONE';
};

function eqSet(as, bs) {
  if (as.size !== bs.size) return false;
  for (var a of as) if (!bs.has(a)) return false;
  return true;
};

function combineAnnotations(abridged, abridged_highlights, abridged_hints) {
  let annotations = [];
  if (abridged.length == 0) {
    return annotations;
  };
  abridged_highlights.forEach( (offset) => {
    let offset_style = offset.concat(['b']);
    annotations.push(offset_style);
  });
  abridged_hints.forEach( (offset) => {
    let offset_style = offset.concat(['i']);
    annotations.push(offset_style);
  });
  // Now need to eliminate overlaps.
  // For each character in text, create a Set. Add each style for that char
  // to the set.
  let textFormat = Array.from(new Array(abridged.length), (_, index) => new Set() );
  for (let offset of annotations) {
    for (let k=offset[0]; k < offset[1]; k++) {
      textFormat[k].add(offset[3]);
    };
  };
  // Now convert back to offset tuples [start, end, substring, style]
  annotations = [];
  let styleStart = 0;
  let style=textFormat[styleStart];
  for (let k=1; k < textFormat.length; k++) {
    if ( ! eqSet(style, textFormat[k])) {
      if (style.size > 0) {
        //Convert set {'i','b'} to 'ib'
        let textStyle = Array.from(style.values()).join('');
        let textspan = abridged.substring(styleStart, k);
        annotations.push([styleStart, k, textspan, textStyle]);
      };
      styleStart = k;
      style=textFormat[styleStart];
    };
  };
  // n.b. slight cheat - we know abridged ends in ... and that ... is never
  // annotated, so we can ignore the last k.
  if (abridged_hints.length > 0) {
    console.log('annotations');
    console.log(annotations);
  };
  return annotations;
};

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

// Note: There may be saved answers for questions no longer
// in the queue because the contingency rule for the question is no
// longer active. We don't want to save those answers.
// Use the queue to identify which questions' answers to save.
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
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
    this.startTutorialOnTaskLoad = this.startTutorialOnTaskLoad.bind(this);
    this.restartTutorial = this.restartTutorial.bind(this);
    this.intro = introJs();
    this.introStarted = false;
    this.state = {
      highlightsStyle: 'highlights-fixed',
    };
  }

  static propTypes = {
    currTask: React.PropTypes.object,
    db: React.PropTypes.object,
    abridged: React.PropTypes.string,
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
        'element': '.quiz-introjs',
        'intro': 'Thank you for joining the project! Before you begin, read through the text provided. Focus in particular on the bold text -- you’ll be answering questions about it later.',
        'position': 'auto',
      },
      {
        'element': '.quiz-questions',
        'intro': 'Next, read and answer the first question presented below the text. Selecting an answer will enable the highlighting tool.',
        'position': 'left',
      },
      {
        'element': '.quiz-introjs',
        'intro': 'Please highlight all relevant words and phrases of the text that justify your answer -- make sure to include every piece of the text which support the answer you chose. When you’ve finished highlighting all relevant text to justify your answer, please check your work, then press "Next" to move onto the next question.',
        'position': 'right',
      },
      {
        'element': '.quiz-questions',
        'intro': 'Repeat this process for all of the remaining questions.',
        'position': 'left',
      },
      {
        'element': '.review-button',
        'intro': 'Look over all your answers and move onto the next set of questions by clicking "Review" and "Save and Next". Thank you for contributing to this project!',
        'position': 'auto',
      }
    ];

    this.intro.setOptions({
      'steps': steps,
      'overlayOpacity': 0.5,
      'scrollToElement': true,
      'exitOnOverlayClick': false,
      'disableInteraction': true,
    });
    this.startTutorialOnTaskLoad();
  }

  componentDidUpdate(prevProps, prevState) {
    this.startTutorialOnTaskLoad();
  }

  startTutorialOnTaskLoad() {
    if (this.props.displayState === displayStates.TASK_LOADED) {
      if ( ! this.introStarted) {
        this.intro.start();
        this.introStarted = true;
      } else {
        this.intro.refresh();
      };
    }
  }

  restartTutorial() {
    this.intro.start();
    this.introStarted = true;
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
    this.intro.exit();
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
    window.scrollTo(0, 0);
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
        <button type="button" className="next-button"
          onClick={() => { this.props.activeQuestion(next_id); }}>
          { "Next" }
        </button>;
    var prev_button = prev_id == question.id ? <div></div> :
        <button type="button" className="previous-button"
          onClick={() => { this.props.activeQuestion(prev_id); }}>
          { "Prev" }
        </button>;
    var buttons = showButton ?
      <div>
        { prev_button }
        { next_button }
      </div>
      : <div></div>;
    return (
      <div key={question.id}>
        <Question question={question} /> 
        { buttons }
      </div>
    );
  }

  selectQuestion() {
    var topic = this.props.currTask ? this.props.currTask.topictree : [];
    var last_question = this.props.question_id == this.props.queue[this.props.queue.length - 1];
    var review_button = last_question ?
      <button type="button" className="review-button"
        onClick={() => { this.props.setReview(true); }}>
        { "Review" }
      </button>
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
              { review_button }
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
    const questionDB = this.props.db.entities.question;
    const question_id = this.props.question_id;
    let hint_type = 'NONE'; // data.nlp_hint_types.py: 'WHO', 'HOW MANY', 'WHEN', 'NONE'
    if (questionDB && questionDB[question_id]) {
      // DB not yet populated with this field
      // hint_type = questionDB[question_id].hint_type;
      // Use the prior technique of using the first word to set the hint type.
      hint_type = inferHintType(questionDB[question_id].question_text);
    };
    const hint_sets_for_article = this.props.db.entities.hint;
    let hint_offsets = [];
    if (hint_sets_for_article && hint_sets_for_article[hint_type]) {
      hint_offsets = hint_sets_for_article[hint_type].offsets;
      console.log('Found '+hint_offsets.length+' '+hint_type+' hints');
      console.log(hint_offsets);
    };

    const { abridged, abridged_highlights, abridged_hints } = abridgeText(
      article_text,
      topic_highlights,
      hint_offsets
    );

    let annotations = combineAnnotations(abridged, abridged_highlights, abridged_hints);

    const { color_array, answer_ids } = getAnswerAnnotations(this.props.answer_colors);

    return (
      <HighlightTool text={abridged}
                     colors={color_array}
                     topics={answer_ids}
                     currentTopicId={this.props.answer_id}
                     hints_offsets={annotations}
      />
    );
  }

  handleScroll() {
    let highlighter = document.querySelector('.quiz-highlighter');
    // Element won't be present on help or done layouts.
    if ( ! highlighter) {
      return;
    };
    let navbar = document.querySelector('.navbar');
    let footer = document.querySelector('footer');
    let getRect = (el) => el.getBoundingClientRect();
    let footerTop = getRect(footer).top;

    // Check if article should start scrolling up when footer collides
    if (getRect(highlighter).bottom >= footerTop) {
      this.setState({ highlightsStyle: 'highlights-absolute'});
    };
    let quizBounds = document.querySelector('.quiz');
    let computedStyle = window.getComputedStyle(quizBounds, null);
    let spaceUnderHeader = parseInt(computedStyle.getPropertyValue("padding-top"), 10);
    // Check if article should stop scrolling back down
    if (getRect(highlighter).top > getRect(navbar).bottom + spaceUnderHeader) {
      this.setState({ highlightsStyle: 'highlights-fixed'});
    };
  }

  render() {
    if (this.props.displayState === displayStates.TASKS_DONE) {
      return <ThankYou />
    }

    if (this.props.displayState === displayStates.SHOW_HELP) {
      return <ShowHelp closeHelp={ () => { this.props.showHelp(false); } } />
    }

    var topic_highlights = this.props.currTask ? this.props.currTask.highlights[0].offsets : [];
    var question_list = this.props.review ? this.dispReview() : this.selectQuestion();

    let saveAndNextButton =  <div/>;
    if (this.props.review && this.allQuestionsAnswered()) {
      saveAndNextButton =  <button className="save-and-next"
                                   onClick={ this.onSaveAndNext }>
                             Save and Next
                           </button>;
    };

    return (
        <div className="quiz clearfix" >
          <div className="quiz-introjs">
            <div className={`quiz-highlighter ${this.state.highlightsStyle}`}>
              <div className="highlighter-help-text">
                Look for answers in the bolded text.
              </div>
              { this.displayHighlighter(topic_highlights) }
            </div>
          </div>

          <div className="quiz-questions">
            <button onClick={this.restartTutorial} className='restart-introjs'>
              Restart Tutorial
            </button>
            <button onClick={ () => { this.props.showHelp(true); } } className='show-help'>
              Help
            </button>
            <Project />
            { question_list }
            { saveAndNextButton }
          </div>
        </div>
    )
  }
}
