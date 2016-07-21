import React, {Component} from 'react';
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
    articles: state.article.articles,
    topics: state.article.topics,
    curArticle: state.article.curArticle
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
    this.props.getArticle(this.props.routeParams.articleId);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.curArticle != nextProps.routeParams.articleId){
      this.props.fetchArticle(nextProps.routeParams.articleId);
    }
  }


  handleNext() {
    this.props.newArticle(this.props.curArticle + 1);
    ReactDOM.findDOMNode(this).scrollIntoView();
  }

  render() {
    let cur_article = this.props.curArticle;
    if (cur_article == null) {
      return false
    }
    let article = this.props.article;
    let topics = this.props.topics[cur_article];

    return (
      <ReactCSSTransitionsGroup transitionName='fadein'
                                transitionAppear
                                transitionAppearTimeout={500}
                                transitionEnterTimeout={500}
                                transitionLeaveTimeout={500}>
        <div className='topic-picker-wrapper col-xs-4'>
          <TopicPicker {...this.props}/>
        </div>
        <div className='tua'>
          <div className='article-wrapper col-xs-8'>
            <ReactCSSTransitionsGroup transitionName='fade-between'
                                      transitionAppear
                                      transitionAppearTimeout={500}
                                      transitionEnterTimeout={500}
                                      transitionLeaveTimeout={500}>
              <Article article={article} key={cur_article}/>
            </ReactCSSTransitionsGroup>
            <br/>
            <button onClick={this.handleNext}>Next</button>
          </div>
        </div>
      </ReactCSSTransitionsGroup>
    );
  }
};
