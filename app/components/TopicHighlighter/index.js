import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { colors } from 'utils/colors';
import HighlightTool from 'components/HighlightTool';
import { TopicPicker, TopicInstruction }  from 'components/TopicPicker';
import Project from 'components/Project';
import ThankYou from 'components/ThankYou';
import { displayStates } from 'components/displaystates';

import { styles } from './styles.scss';

const style = require('intro.js/introjs.css');
import { introJs } from 'intro.js/intro.js';

// Two different strategies - the topic picker has additional classnames attached
// so that we can apply the sass variable $pybossa-header-height
// The second one gets a dynamic style since just need to change 'position'
var scrollStyles = {
  'instrFixed': {
    position: 'fixed'
  },
  'instrAbsolute': {
    position: 'absolute'
  }
};

export class TopicHighlighter extends Component {
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
      instrStyle: scrollStyles.instrFixed,
      topicStyle: 'topic-picker-fixed',
    };
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
    var steps = [
      {
        'element': '#article-introjs',
        'intro': 'Thank you for joining the project! Before you start, skim through the text provided -- you\'ll sort it into different topics later.',
        'position': 'left',
      },
      {
        'element': '.topic-picker-wrapper',
        'intro': 'Now, look at these tabs on the left and read through the topic descriptions. These describe what you will be looking for in the text.',
        'position': 'right',
      },
      {
        'element': '.instructions',
        'intro': 'Here are some more detailed instructions about each topic. Currently, it\'s describing more about the first selected topic.',
        'position': 'top',
      },
      {
        'element': '#article-introjs',
        'intro': 'Then, we return to the article! Highlight the places in the article that fall into the first topic.',
        'position': 'left',
      },
      {
        'element': '.topic-picker-wrapper',
        'intro': 'When you are finished highlighting text about the first topic, move onto the second topic. (You can always return to previous topics if you come across more relevant words or phrases -- just click on the topic tab and continue highlighting.) Remember: each topic has its own color highlighter, so be sure that the you are highlighting text in the corresponding color for each topic.',
        'position': 'right',
      },
      {
        'element': '#article-introjs',
        'intro': 'Repeat this process for every remaining topic.',
        'position': 'left',
      },
      {
        'element': '.save-and-next',
        'intro': 'When you’re finished, take a minute to scan your work and ensure that you’ve highlighted all the relevant pieces of text in each topic’s corresponding color. Add and remove highlighting as necessary before pressing "Save and next" to submit your work. Thank you for your contribution to this project!',
        'position': 'left',
      },
    ];

    this.intro.setOptions({
      'steps': steps,
      'overlayOpacity': 0.5,
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

  // The idea here is to handle all the dynamic layout in this
  // component, rather than jamming code specific to this layout
  // down into the called components.
  handleScroll() {
    let navbar = document.querySelector('.navbar');
    let footer = document.querySelector('footer');
    let topicPicker = document.querySelector('.topic-picker-wrapper');
    let getRect = (el) => el.getBoundingClientRect();
    let footerTop = getRect(footer).top;

    // Check if topic picker should start scrolling up
    if (getRect(topicPicker).bottom >= footerTop) {
      this.setState({ topicStyle: 'topic-picker-absolute'});
    };
    // Check if topic picker should stop scrolling back down
    if (getRect(topicPicker).top > getRect(navbar).bottom) {
      this.setState({ topicStyle: 'topic-picker-fixed' });
    };

    // Check if instructions block should start scrolling up
    if (footerTop < window.innerHeight) {
      this.setState({ instrStyle: scrollStyles.instrAbsolute });
    } else {
      this.setState({ instrStyle: scrollStyles.instrFixed });
    };
  }

  // Babel plugin transform-class-properties allows us to use
  // ES2016 property initializer syntax. So the arrow function
  // will bind 'this' of the class. (React.createClass does automatically.)
  onSaveAndNext = () => {
    window.scrollTo(0, 0);
    this.props.saveAndNext(this.props.highlights);
    this.props.clearHighlights();
  }

  render() {
    if (this.props.displayState === displayStates.TASKS_DONE) {
      return <ThankYou />
    }

    let loadingClass = this.props.displayState === displayStates.BEFORE_LOAD ? 'loading' : '';

    return (
      <div className={loadingClass}>
        <div className='topic-highlighter-wrapper'>
          <TopicPicker
            topics={this.props.topics}
            topicStyle={this.state.topicStyle}
          />
          <div className="highlighter-tool" key={this.props.article.articleId}>
            <button onClick={this.restartTutorial} className='restart-introjs'>
              Restart Tutorial
            </button>
            <Project />
            <div id='article-introjs'>
              <HighlightTool
                text={this.props.article.text}
                topics={this.props.topics.results}
                colors={colors}
                currentTopicId={this.props.currentTopicId}
              />
            </div>
            <button onClick={this.onSaveAndNext} className='save-and-next'>Save and Next</button>
          </div>
          <TopicInstruction instrStyle={this.state.instrStyle} />
        </div>
      </div>
    );
  }
};
