import { newArticle } from 'actions/actions';
import Article from 'components/annotation/article';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactCSSTransitionsGroup from 'react-addons-css-transition-group';
import { connect } from 'react-redux';
import TopicPicker from 'components/annotation/topicPicker';

import 'fade.scss';

const mapDispatchToProps = dispatch => {
  return {
    onNewArticle: article => {
      dispatch(newArticle(article));
    }
  };
}

const mapStateToProps = state => {
  return { articles: state.articleReducers.articles,
           curArticle: state.articleReducers.curArticle };
}

const Tua = React.createClass({
  displayName: 'Tua',

  childContextTypes: {
    params: React.PropTypes.object.isRequired
  },

  getChildContext() {
    return {
      params: this.props.params
    };
  },

  propTypes: {
    articles: React.PropTypes.array,
    onNewArticle: React.PropTypes.func,
    params: React.PropTypes.object.isRequired,
    curArticle: React.PropTypes.number
  },

  handleNext() {
    this.props.onNewArticle(this.props.curArticle + 1);
    ReactDOM.findDOMNode(this).scrollIntoView();
  },

  render() {
    // TODO: we need to have a larger discussion of route design
    // const {cur_article}: string = this.props.params;
    let cur_article = this.props.curArticle;
    let tua = this.props.articles[cur_article];
    let article = tua.article;
    let topics = tua.analysis_type.topics;

    return (
      <ReactCSSTransitionsGroup transitionName='fadein'
                                transitionAppear
                                transitionAppearTimeout={500}
                                transitionEnterTimeout={500}
                                transitionLeaveTimeout={500}>
        <div className='tua'>
          <div className='text-wrapper'>
            <ReactCSSTransitionsGroup transitionName='fade-between'
                                      transitionAppear
                                      transitionAppearTimeout={500}
                                      transitionEnterTimeout={500}
                                      transitionLeaveTimeout={500}>
              <Article topics={topics} article={article} key={cur_article}/>
            </ReactCSSTransitionsGroup>
            <br/>
            <button onClick={this.handleNext}>Next</button>
          </div>
          <TopicPicker topics={topics}/>
        </div>
      </ReactCSSTransitionsGroup>
    );
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Tua);
