import React, {Component} from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import ReactDOM from 'react-dom';
import ReactCSSTransitionsGroup from 'react-addons-css-transition-group';
import { connect } from 'react-redux';

import * as articleActionCreators from 'actions/article';
import * as topicsActionCreators from 'actions/topicPicker';
import * as projectActionCreators from 'actions/project';

const assembledActionCreators = Object.assign({}, articleActionCreators, topicsActionCreators, projectActionCreators)

import Article from 'components/Article';
import TopicPicker from 'components/TopicPicker';
import Project from 'components/Project';

import { styles } from './styles.scss';

const mapStateToProps = state => {
  return {
    article: state.article.article,
    currentArticle: state.article.currentArticle,
    currentTopicId: state.topicPicker.currentTopicId,
    nextArticle: state.article.nextArticle,
    topics: state.topicPicker.topics
  };
}

@connect (
    mapStateToProps,
    dispatch => bindActionCreators(assembledActionCreators, dispatch)
)

export class TopicHighlighter extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.fetchArticle(this.props.routeParams.articleId);
    this.props.fetchTopics();
    this.props.fetchProject();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.currentArticle != nextProps.routeParams.articleId && !nextProps.article.isFetching){
      this.props.fetchArticle(nextProps.routeParams.articleId);
    }
  }

  render() {
    let current_article = this.props.currentArticle;
    let article = this.props.article;
    if (this.props.nextArticle == undefined) {
      return (<div>DONE</div>) // TODO: Clean this up.
    }

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
              {<Article
                article={article}
                key={current_article}
                topics={this.props.topics}
                currentTopicId={this.props.currentTopicId}
                postArticleHighlights={this.props.postArticleHighlights}
              />}
            </ReactCSSTransitionsGroup>
            <br/>
            <button><Link to={`/article/${this.props.nextArticle}`}>Fetch next Article</Link></button>
            <div className="space"></div>
        </div>
      </ReactCSSTransitionsGroup>
    );
  }
};
