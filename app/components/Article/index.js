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
    article: React.PropTypes.object.isRequired
  },

  componentDidMount: function() {
    let articleContainer = document.getElementById('article-container');
    this.annotationsObject = new TextHighlighter(articleContainer);
  },

  serializeHighlights: function() {
    return this.annotationsObject.serializeHighlights();
  },

  render() {
    console.log(this.props);
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
        <button onClick={this.props.serializeHighlights.bind(this, this.serializeHighlights, this.props)}>Submit highlights</button>
      </div>
    );
  }

});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Article);
