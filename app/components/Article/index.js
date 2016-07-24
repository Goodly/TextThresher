import React from 'react';
import { addHighlight } from 'actions/article';
import { connect } from 'react-redux';

import 'text-highlighter/src/TextHighlighter'

import { styles } from './styles.scss';

const mapDispatchToProps = dispatch => {
  return {
    onHighlight: (start, end, selectedText) => {
      dispatch(addHighlight(start, end, selectedText));
    }
  };
}

const mapStateToProps = state => {
  return {
    article: state.article.article,
    currentTopic: state.article.currentTopic
  };
}

const Article = React.createClass({
  displayName: 'Article',

  propTypes: {
    article: React.PropTypes.object.isRequired
  },

  componentDidMount: function() {
    let articleContainer = document.getElementById('article-container');
    this.annotationsObject = new TextHighlighter(articleContainer);
  },

  render() {
    let article = this.props.article.article;
    var text = this.props.article.text;

    let fetchingClass = this.props.article.isFetching ? 'is-fetching' : '';
    return (
      <div className={`article ${fetchingClass}`}>
        <div className='article__header-text'>
          Please skim the text below and highlight words about the Topics listed in the margins.
        </div>
        <div ref={(ref) => this.articleRef = ref} id='article-container'>
          {text}
        </div>
      </div>
    );
  }

});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Article);
