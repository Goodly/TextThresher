import { newArticle } from 'actions/actions';
import Article from 'components/annotation/article';
import React from 'react';
import ReactCSSTransitionsGroup from 'react-addons-css-transition-group';
import { connect } from 'react-redux';
import Topics from 'components/annotation/topics';
import TopicPicker from 'components/annotation/topicPicker';
import tmpdata from 'assets/tmpArticles.json';
import data from 'assets/tua.json';

import 'fadeIn.scss';

const mapDispatchToProps = dispatch => {
  return {
    onNewArticle: article => {
      dispatch(newArticle(article));
    }
  };
}

const mapStateToProps = state => {
  return { article: state.articleReducers.article };
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
    article: React.PropTypes.object,
    onNewArticle: React.PropTypes.function,
    params: React.PropTypes.object.isRequired
  },

  handleNext(e) {
    this.props.onNewArticle(tmpdata.results);
  },

  render() {
    const {tua_id}: string = this.props.params;
    // let tua = this.state.tua[tua_id];
    let tua = this.props.article[tua_id];
    let article = tua.article;
    let topics = tua.analysis_type.topics;

    return (
      <ReactCSSTransitionsGroup transitionName='fadein' transitionAppear>
        <div className='tua'>
          <div className='text-wrapper'>
            <Article topics={topics} article={article}/>
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
