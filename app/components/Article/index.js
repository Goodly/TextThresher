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
  };
}

const Article = React.createClass({
  displayName: 'Article',

  propTypes: {
    article: React.PropTypes.object.isRequired,
    postArticleHighlights: React.PropTypes.func.isRequired
  },

  componentDidMount: function() {
    let articleContainer = document.getElementById('article-container');
    this.annotationsObject = new TextHighlighter(articleContainer);
  },

  serializeHighlights: function() {
    let highlightsString = this.annotationsObject.serializeHighlights();
    this.props.postArticleHighlights(highlightsString, this.props.article.article_id);
  },

  render() {
    let article = this.props.article.article;
    var text = this.props.article.text;
  
    let fetchingClass = this.props.article.isFetching ? 'is-fetching' : '';
    return (
      <div className={`article ${fetchingClass}`}>
        <div className='article__header-text'>
        </div>
        <div ref={(ref) => this.articleRef = ref} id='article-container'>
          {text}
        </div>
        <button onClick={this.serializeHighlights}>Submit highlights</button>
      </div>
    );
  }

});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Article);
