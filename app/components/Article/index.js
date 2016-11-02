import React from 'react';
import { addHighlight } from 'actions/article';
import { connect } from 'react-redux';

import HighlightTool from 'components/HighlightTool';
import { styles } from './styles.scss';
import { colors } from 'utils/colors';

const mapDispatchToProps = dispatch => {
  return {
    onHighlight: (start, end, selectedText) => {
      dispatch(addHighlight(start, end, selectedText));
    }
  };
}

const mapStateToProps = state => {
  return {
  };
}

const Article = React.createClass({
  displayName: 'Article',

  propTypes: {
    article: React.PropTypes.object.isRequired,
    topics: React.PropTypes.object.isRequired,
    currentTopicId: React.PropTypes.number.isRequired,
    postArticleHighlights: React.PropTypes.func.isRequired
  },

  componentDidMount: function() {
  },

  serializeHighlights: function() {
    let highlightsString = this.annotationsObject.serializeHighlights();
    this.props.postArticleHighlights(highlightsString, this.props.article.article_id);
  },

  render() {
    let article = this.props.article;
    let text = article.text;

    let fetchingClass = this.props.article.isFetching ? 'is-fetching' : '';
    return (
      <div className={`article ${fetchingClass}`}>
        <div className='article__header-text'>
        </div>
        <div ref={(ref) => this.articleRef = ref} id='article-container'>
          <HighlightTool
            text={text}
            topics={this.props.topics.results}
            colors={colors}
            currentTopicId={this.props.currentTopicId}
          />
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
