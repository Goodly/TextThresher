import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ReactCSSTransitionsGroup from 'react-addons-css-transition-group';

import { colors } from 'utils/colors';
import HighlightTool from 'components/HighlightTool';
import TopicPicker from 'components/TopicPicker';
import Project from 'components/Project';

import { styles } from './styles.scss';

export class TopicHighlighter extends Component {
  constructor(props) {
    super(props);
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
        <div className='topic-picker-wrapper'>
          <TopicPicker topics={this.props.topics} />
        </div>
        <div className='article-wrapper'>
            <Project />
            <ReactCSSTransitionsGroup transitionName='fade-between'
                                      transitionAppear
                                      transitionAppearTimeout={500}
                                      transitionEnterTimeout={500}
                                      transitionLeaveTimeout={500}>
              <div className="article" key={this.props.article.articleId}>
                <div className='article__header-text'>
                </div>
                <div id='article-container'>
                  <HighlightTool
                    text={this.props.article.text}
                    topics={this.props.topics.results}
                    colors={colors}
                    currentTopicId={this.props.currentTopicId}
                  />
                </div>
              </div>
            </ReactCSSTransitionsGroup>
            <br/>
            <button onClick={this.onSaveAndNext}>Save and Next</button>
            <div className="space"></div>
        </div>
      </ReactCSSTransitionsGroup>
    );
  }
};
