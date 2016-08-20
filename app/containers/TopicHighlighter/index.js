import React, {Component} from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import ReactDOM from 'react-dom';
import ReactCSSTransitionsGroup from 'react-addons-css-transition-group';
import { connect } from 'react-redux';

import * as articleActionCreators from 'actions/article';
//import * as topicpickerActionCreators from 'actions/topicpicker';

const assembledActionCreators = Object.assign({}, articleActionCreators)
//const assembledActionCreators = Object.assign({}, articleActionCreators)

import Article from 'components/Article';
import TopicPicker from 'components/TopicPicker';
import { styles } from './styles.scss';

const mapStateToProps = state => {
  console.log('TOPIC HIGHLIGHTER MAPSTATETOPROPS')
  console.log(state)
  return {
    article: state.article.article,
    currentArticle: state.article.currentArticle,
    nextArticle: state.article.nextArticle,
    topics: state.article.topics,
    currentTopic: state.article.currentTopic,
    colors: state.article.colors
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
    console.log('TOPICHILIGHTER COMPONENTDIDMOUNT')
    console.log(this.props)
    //this.props.colors = ['rgb(241, 96, 97)', 'rgb(253, 212, 132)', 'rgb(175, 215, 146)', 'rgb(168, 210, 191)', 'rgb(255,153,000)', 'rgb(102,000,153)', 'rgb(000,153,153)', 'rgb(255,102,255)', 'rgb(000,051,153)', 'rgb(153,000,204)', 'rgb(70,194,64)', 'rgb(94,242,188)'];
    this.props.fetchArticle(this.props.routeParams.articleId);
    this.props
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.currentArticle != nextProps.routeParams.articleId && !nextProps.article.isFetching){
      this.props.fetchArticle(nextProps.routeParams.articleId);
    }
  }

  render() {
    //var colors =['rgb(241, 96, 97)', 'rgb(253, 212, 132)', 'rgb(175, 215, 146)', 'rgb(168, 210, 191)', 'rgb(255,153,000)', 'rgb(102,000,153)', 'rgb(000,153,153)', 'rgb(255,102,255)', 'rgb(000,051,153)', 'rgb(153,000,204)', 'rgb(70,194,64)', 'rgb(94,242,188)'];
    let current_article = this.props.currentArticle;
    console.log('TOPICHILIGHTER RENDER')
    console.log(this.props)
    let article = this.props.article;
    let topics = this.props.topics[current_article];

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
          <TopicPicker {...this.props}/>
        </div>
        <div className='article-wrapper'>
            <ReactCSSTransitionsGroup transitionName='fade-between'
                                      transitionAppear
                                      transitionAppearTimeout={500}
                                      transitionEnterTimeout={500}
                                      transitionLeaveTimeout={500}>
            {<Article article={article} key={current_article} colors={this.props.colors}/>}
            </ReactCSSTransitionsGroup>
            <br/>
            <button><Link to={`/article/${this.props.nextArticle}`}>Next Article</Link></button>
        </div>
      </ReactCSSTransitionsGroup>
    );
  }
};
