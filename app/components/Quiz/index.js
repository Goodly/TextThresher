import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { Map as ImmutableMap } from 'immutable';
import Color from 'color';

import Question from 'components/Question';
import Project from 'components/Project';
import ThankYou from 'components/ThankYou';
import ShowHelp from 'components/ShowHelp';
import SelectHint from 'components/SelectHint';
import { displayStates } from 'components/displaystates';

import { Spanner,
         EditorState,
         BlockMaker,
         makeOffsetsFromWhiteSpace,
       } from 'components/TextSpanner';
import { QuizLayerTypes,
         sortLayersByAnswerId,
         moveAnswerToTop } from 'model/QuizLayerLabel';
import { QuizAnswers } from 'model/QuizAnswers';
import { loadTopicHighlights,
         loadHints,
       } from './convertToSpanner';
import { handleMakeHighlight, moveToTokenBoundaries } from
  'components/TextSpanner/handlers/makeHighlight';

const debug = require('debug')('thresher:Quiz');

import { styles } from './styles.scss';

const style = require('intro.js/introjs.css');
import { introJs } from 'intro.js/intro.js';

import { Slider } from 'components/Slider';

const CONTEXT_WORD_VALUES = [0,1,2,3,4,5,6,7,8,9,10,12,20,50,100,200,400];

// Note: There may be saved answers for questions no longer
// in the queue because the contingency rule for the question is no
// longer active. We don't want to save those answers.
// Use the queue to identify which questions' answers to save.
// Note, for now answer_selected has the answered questions, and
// answerState has any highlights for those answers.
function saveQuizAnswers(questionDB, queue, answer_selected, answerState) {
  let savedQuiz = [];
  queue.forEach( (question_id) => {
    if (answer_selected.has(question_id)) {
      let answerMap = answer_selected.get(question_id);
      for (let answer of answerMap.values()) {
        if (answerState.hasAnswer(answer.answer_id)) {
          const annotations = answerState.getAnswerAnnotations(answer.answer_id);
          answer['highlights'] = annotations;
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

    this.loadEditorState = this.loadEditorState.bind(this);
    this.wrapSpan = this.wrapSpan.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleDeleteKey = this.handleDeleteKey.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
    this.startTutorialOnTaskLoad = this.startTutorialOnTaskLoad.bind(this);
    this.restartTutorial = this.restartTutorial.bind(this);
    this.setContextWords = this.setContextWords.bind(this);
    this.getStyle = this.getStyle.bind(this);
    this.intro = introJs();
    this.introStarted = false;
    let editorState = EditorState.createEmpty();
    let answerState = new QuizAnswers(editorState);
    this.state = {
      highlightsStyle: 'highlights-fixed',
      contextWordsIndex: 10,
      contextWords: CONTEXT_WORD_VALUES[10],
      editorState,
      answerState,
      blockMaker: new BlockMaker(),
    };
  }

  static propTypes = {
    currTask: React.PropTypes.object,
    db: React.PropTypes.object,
    queue: React.PropTypes.array,
    question_id: React.PropTypes.number,
    answer_id: React.PropTypes.number,
    answer_selected: React.PropTypes.instanceOf(ImmutableMap).isRequired,
    answer_colors: React.PropTypes.instanceOf(ImmutableMap).isRequired,
    saveAndNext: React.PropTypes.func,
    review: React.PropTypes.bool,
    done: React.PropTypes.bool,
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('keyup', this.handleKeyUp);
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
    window.removeEventListener('keyup', this.handleKeyUp);
    this.intro.exit();
  }

  loadEditorState(currTask) {
    const article_text = this.props.currTask.article.text;
    let editorState = EditorState.createEmpty();
    let answerState = new QuizAnswers(editorState);
    editorState = editorState.setText(article_text);
    let tokenOffsets = makeOffsetsFromWhiteSpace(article_text);
    editorState = editorState.setTokenization(tokenOffsets);

    const topic_highlights = this.props.currTask.highlights;
    let topicLayer = loadTopicHighlights(editorState, topic_highlights);

    let blockMaker = new BlockMaker();
    blockMaker.setTokenization(
      editorState.getText(),
      editorState.getTokenization()
    );
    blockMaker.combineLayers([topicLayer]);

    loadHints(editorState, this.props.db.entities.hint);

    this.setState({
      editorState,
      answerState,
      blockMaker,
    });
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
    const questionDB = this.props.db.entities.question;
    const queue = this.props.queue;
    const answer_selected = this.props.answer_selected;
    const answerState = this.state.answerState;
    const savedAnswers = saveQuizAnswers(questionDB, queue, answer_selected, answerState);
    const article_id = this.props.currTask ? this.props.currTask.article.id : '';
    const article_text = this.props.currTask ? this.props.currTask.article.text : '';
    const highlight_group_id = this.props.currTask.highlights[0].id;
    const savedQuiz = {
      article_id,
      article_text,
      highlight_group_id,
      savedAnswers,
    };
    this.props.clearAnswers();
    // Don't have to reset answerState, as it and editorState will be
    // created fresh on next task load.
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
      // Topics are sorted by their topic_number field in ascending order.
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
    return (
      <div>
        Did not find the question with id: {this.props.question_id}
      </div>
    );
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

  displayHighlighter() {
    let editorState = this.state.editorState;
    let blockMaker = this.state.blockMaker;

    // Determine blocks to view given current contextWords setting
    let blocks = blockMaker.getBlocksWithContext(this.state.contextWords);
    let displayState = editorState.createDisplayState();
    displayState.setDisplayBlocks(blocks);

    // Move current answer to end of list so it renders on
    // top of any other answers.
    let layers = editorState.getLayers();
    layers.sort(sortLayersByAnswerId);
    layers = moveAnswerToTop(layers, this.props.answer_id);
    displayState.setDisplayLayers(layers);

    const questionDB = this.props.db.entities.question;
    const question_id = this.props.question_id;
    let hint_type = 'NONE'; // data.nlp_hint_types.py: 'WHO', 'HOW MANY', 'WHEN', 'NONE'
    if (questionDB && questionDB[question_id]) {
      hint_type = questionDB[question_id].hint_type;
    };
    if (this.props.displayHintSelectControl) {
      hint_type = this.props.displayHintType;
    };

    return (
      <div className="article-click-box"
        onMouseUp={ () => { this.handleMouseUp(blockMaker) }}
        onKeyDown={ this.handleDeleteKey }
        tabIndex="0"
      >
        <Spanner
          editorState={editorState}
          displayState={displayState}
          blockPropsFn={getBlockProps}
          mergeStyleFn={ (orderedLayers) => {
            return this.getStyle(orderedLayers, hint_type);
          }}
          wrapSpanFn={this.wrapSpan}
        />
      </div>
    );
  }

  wrapSpan(reactSpan, orderedLayers) {
    // Let's just show labels for answers, not topics or hints
    const answerHighlights = orderedLayers.filter( (ola) =>
      ola.layer.layerLabel.layerType === QuizLayerTypes.ANSWER
    );
    const titleList = answerHighlights.map( (ola) => {
      return ola.annotation.source.shortLabel();
    });
    const title = titleList.join(', ');
    let mergeProps = { title };
    // Create select handler for just the topmost highlight
    if (answerHighlights.length > 0) {
      const annotation = answerHighlights.slice(-1)[0].annotation;
      Object.assign(mergeProps, {
        onClick: (evt) => {
          this.handleSelect(evt, annotation);
        }
      });
    };
    return React.cloneElement(reactSpan, mergeProps);
  }

  handleMouseUp(blockMaker) {
    let articleHighlight = handleMakeHighlight();
    let question_id = this.props.question_id;
    let question = this.props.db.entities.question[question_id];
    let question_number = question.question_number;
    // Don't make highlights if no answer selected
    let answer_id = this.props.answer_id;
    if (answer_id < 0) {
      return;
    };
    articleHighlight = moveToTokenBoundaries(blockMaker, articleHighlight);
    if (articleHighlight !== null) {
      let {start, end} = articleHighlight;
      let article_text = blockMaker.getText();
      articleHighlight['text'] = article_text.substring(start, end);
      let answerState = this.state.answerState;
      answerState.addHighlight(answer_id, articleHighlight,
                               question_id, question_number);
      this.setState({answerState});
    };
  }

  handleSelect(evt, annotation) {
    // Activate the question for this highlight
    const question_id = annotation.source.question_id;
    this.props.activeQuestion(question_id);
    let answerState = this.state.answerState;
    answerState.selectHighlight(annotation);
    this.setState({answerState});
  }

  handleDeleteKey(e) {
    // Don't steal backspace and delete key from input elements!
    if (document.activeElement.nodeName === "INPUT") {
      return;
    };
    if (e.keyCode == 46 || e.keyCode == 8) {
      let answerState = this.state.answerState;
      answerState.deleteSelection();
      this.setState({answerState});
    }
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

  handleKeyUp(evt) {
    // Don't steal keystrokes from input elements!
    if (document.activeElement.nodeName === "INPUT") {
      return;
    };
    // 72 is 'h' key
    if (evt.keyCode === 72) {
      this.props.displayHintSelector( ! this.props.displayHintSelectControl);
    }
  }

  setContextWords(index) {
    this.setState({
      contextWordsIndex: index,
      contextWords: CONTEXT_WORD_VALUES[index]
    });
  }

  render() {
    if (this.props.displayState === displayStates.TASKS_DONE) {
      return <ThankYou />
    }

    if (this.props.displayState === displayStates.SHOW_HELP) {
      return <ShowHelp closeHelp={ () => { this.props.showHelp(false); } } />
    }

    var question_list = this.props.review ? this.dispReview() : this.selectQuestion();

    let saveAndNextButton =  <div/>;
    if (this.props.review && this.allQuestionsAnswered()) {
      saveAndNextButton =  <button className="save-and-next"
                                   onClick={ this.onSaveAndNext }>
                             Save and Next
                           </button>;
    };

    return (
        <div className="quiz clearfix">
          <div className="quiz-introjs">
            <div className={`quiz-highlighter ${this.state.highlightsStyle}`}>
              <div className="highlighter-help-text">
                Look for answers in the bolded text.
              </div>
              { this.displayHighlighter() }
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
            <Slider
              index={this.state.contextWordsIndex}
              values={CONTEXT_WORD_VALUES}
              onChange={(evt) => {
                this.setContextWords(Number(evt.target.value));
              }}
              style={{marginTop: '10px'}}
            />
            <div className="contextWordControlHeader">
              Number of context words to show: {CONTEXT_WORD_VALUES[this.state.contextWordsIndex]}
            </div>
            <SelectHint
              currTask={this.props.currTask}
              onChange={ (evt) => { this.props.setDisplayHintType(evt.target.value); }}
            />
          </div>
        </div>
    )
  }

  getStyle(orderedLayers, hint_type) {
    // orderedLayers is an array of objects with keys:
    // {order, layer, annotation}
    const answer_colors = this.props.answer_colors;
    const reviewMode = this.props.review;
    const active_answer_id = this.props.answer_id;
    let style = {};
    for (let layer of orderedLayers) {
      let layerType = layer.layer.layerLabel.layerType;
      if (layerType === QuizLayerTypes.TOPIC) {
        Object.assign(style, { fontWeight: 'bold' });
      }
      if (layerType === QuizLayerTypes.HINT) {
        if (layer.layer.layerLabel.hintType === hint_type) {
          Object.assign(style, { fontStyle: 'italic' });
        };
      }
      if (layerType === QuizLayerTypes.ANSWER) {
        let answer_id = layer.annotation.source.answer_id;
        if (reviewMode === false || active_answer_id === answer_id) {
          if (answer_colors.has(answer_id)) {
            let bgColor = Color(answer_colors.get(answer_id));
            if (bgColor.dark()) {
              bgColor = bgColor.fade(0.5);
            };
            Object.assign(style, { backgroundColor: bgColor.rgb().string() });
          };
          if (this.state.answerState.highlightSelected(layer.annotation.key)) {
            Object.assign(style, {
              borderTop: '1px solid red',
              borderBottom: '1px solid red'
            });
          };
        };
      };
    };
    return style;
  }
}

// sequence_number can be used for even/odd styling...
function getBlockProps(block, sequence_number) {
  let props = {};
  switch (block.blockType) {
    case 'unstyled': {
      if (sequence_number % 2) {
        props['style'] = { backgroundColor: 'whitesmoke' };
      } else {
        props['style'] = { backgroundColor: 'white' };
      };
    }
  }
  return props;
}
