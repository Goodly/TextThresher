import { newArticle } from 'actions/actions';
import Article from 'components/annotation/article';
import React from 'react';
import ReactCSSTransitionsGroup from 'react-addons-css-transition-group';
import { connect } from 'react-redux';
import TopicPicker from 'components/annotation/topicPicker';
import tmpdata from 'assets/tmpArticles.json';

import 'fadeIn.scss';

const mapDispatchToProps = dispatch => {
  return {
    onNewArticle: article => {
      dispatch(newArticle(article));
    }
  };
}

const mapStateToProps = state => {
  return { articles: state.articleReducers.article };
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
    params: React.PropTypes.object.isRequired
  },

  handleNext() {
    this.props.onNewArticle(tmpdata.results);
  },

  render() {
    const {tua_id}: string = this.props.params;
    let tua = this.props.articles[tua_id];
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
