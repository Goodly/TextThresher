import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ReactCSSTransitionsGroup from 'react-addons-css-transition-group';

import { colors } from 'utils/colors';
import HighlightTool from 'components/HighlightTool';
import { TopicPicker, TopicInstruction }  from 'components/TopicPicker';
import Project from 'components/Project';

import { styles } from './styles.scss';

var scrollStyles = {
  'topicFixed': {
    position: 'fixed',
    top: '70px',
    bottom: 'auto'
  },
  'topicAbsolute': {
    position: 'absolute',
    top: 'auto',
    bottom: '0px'
  },
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
    this.state = {
      instrStyle: scrollStyles.instrFixed,
      topicStyle: scrollStyles.topicFixed
    };
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  // The idea here is to handle all the dynamic layout in this
  // component, rather than jamming code specific to this layout
  // down into the called components.
  handleScroll() {
    let navbar = document.querySelector('nav.navbar');
    let footer = document.querySelector('footer');
    let topicPicker = document.querySelector('.topic-picker-wrapper');
    let getRect = (el) => el.getBoundingClientRect();
    let footerTop = getRect(footer).top;

    // Check if topic picker should start scrolling
    if (footerTop - 1 < getRect(topicPicker).bottom) {
      this.setState({ topicStyle: scrollStyles.topicAbsolute});
    };
    // Check if topic picker should stop scrolling
    if (getRect(topicPicker).top > getRect(navbar).height) {
      this.setState({ topicStyle: scrollStyles.topicFixed});
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
    this.props.saveAndNext(this.props.highlights);
  }

  render() {
    // TODO: Detect if done
    // return (<div>DONE</div>)

    let loadingClass = this.props.article.isFetching ? 'loading' : '';

    return (
      <ReactCSSTransitionsGroup transitionName='fadein'
                                transitionAppear
                                transitionAppearTimeout={500}
                                transitionEnterTimeout={500}
                                transitionLeaveTimeout={500}>
        <div className={loadingClass}></div>

        <div className='topic-highlighter-wrapper'>
            <TopicPicker
              topics={this.props.topics}
              topicStyle={this.state.topicStyle}
            />
            <ReactCSSTransitionsGroup transitionName='fade-between'
                                      transitionAppear
                                      transitionAppearTimeout={500}
                                      transitionEnterTimeout={500}
                                      transitionLeaveTimeout={500}>
              <div className="article" key={this.props.article.articleId}>
                <Project />
                <div id='article-container'>
                  <HighlightTool
                    text={this.props.article.text}
                    topics={this.props.topics.results}
                    colors={colors}
                    currentTopicId={this.props.currentTopicId}
                  />
                </div>
                <button onClick={this.onSaveAndNext}>Save and Next</button>
              </div>
            </ReactCSSTransitionsGroup>
            <TopicInstruction instrStyle={this.state.instrStyle} />
        </div>
      </ReactCSSTransitionsGroup>
    );
  }
};
