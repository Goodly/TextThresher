import React, {Component} from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import ReactDOM from 'react-dom';
import ReactCSSTransitionsGroup from 'react-addons-css-transition-group';
import { connect } from 'react-redux';

import * as articleActionCreators from 'actions/article';

const assembledActionCreators = Object.assign({}, articleActionCreators)

import Article from 'components/Article';
import TopicPicker from 'components/TopicPicker';

import { styles } from './styles.scss';

const mapStateToProps = state => {
  return {
    article: state.article.article,
    currentArticle: state.article.currentArticle,
    nextArticle: state.article.nextArticle,
    topics: state.article.topics
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
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.currentArticle != nextProps.routeParams.articleId && !nextProps.article.isFetching){
      this.props.fetchArticle(nextProps.routeParams.articleId);
    }
  }

  articleNotLoaded() {
    if(this.props.article.isFetching) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            zIndex: '100',
            top: '0px',
            position: 'fixed',
            backgroundColor: 'rgba(30, 30, 30, 0.2)'
          }}
      ></div>
      );
    } else {
      return <div></div>;
    }
  }

  render() {
    let current_article = this.props.currentArticle;

    let article = this.props.article;
    let topics = this.props.topics[current_article];

    if (this.props.nextArticle == undefined) {
      return (<div>DONE</div>) // TODO: Clean this up.
    }

    return (
      <ReactCSSTransitionsGroup transitionName='fadein'
                                transitionAppear
                                transitionAppearTimeout={500}
                                transitionEnterTimeout={500}
                                transitionLeaveTimeout={500}>
        { this.articleNotLoaded() }
        <div className='topic-picker-wrapper'>
          <TopicPicker {...this.props}/>
        </div>
        <div className='article-wrapper'>
            <ReactCSSTransitionsGroup transitionName='fade-between'
                                      transitionAppear
                                      transitionAppearTimeout={500}
                                      transitionEnterTimeout={500}
                                      transitionLeaveTimeout={500}>
            {<Article article={article} key={current_article}/>}
            </ReactCSSTransitionsGroup>
            <br/>
            <button><Link to={`/article/${this.props.nextArticle}`}>Next Article</Link></button>
        </div>
      </ReactCSSTransitionsGroup>
    );
  }
};
