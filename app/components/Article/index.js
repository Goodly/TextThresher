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
  return {currentTopic: state.article.currentTopic };
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
    var text = this.props.article.text;

    return (
      <div className='article'>
        <div className='tua__header-text'>
          Focus on the bold text about FOO and answer the questions.
        </div>
        <div ref={(ref) => this.articleRef = ref} id='article-container' className='article'>
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
