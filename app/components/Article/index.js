import React from 'react';
import { addHighlight, deleteHighlight, selectHighlight } from 'actions/article';
import { connect } from 'react-redux';

import HighlightModule from 'components/highlight/highlight';

import { styles } from './styles.scss';

/*const mapDispatchToProps = dispatch => {
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
}*/
const mapStateToProps = state => {
  return {
          highlights: state.article.highlights,
          currentTopic: state.article.currentTopic,
          topics: state.article.topics
       };
}

const Article = React.createClass({
  displayName: 'Article',

  propTypes: {
    article: React.PropTypes.object.isRequired
  },

  componentDidMount: function() {
    let articleContainer = document.getElementById('article-container');
  },

  serializeData: function() {
    return this.props.Highlight.highlights;
  },

  render() {
    console.log("child test")
    console.log(this.props.children)

    let fetchingClass = this.props.article.isFetching ? 'is-fetching' : '';
    return (
      <div className={`article ${fetchingClass}`}>
        <div className='article__header-text'>
          Please skim the text below and highlight words about the Topics listed in the margins.
        </div>
        <div id='article-container' className='article'>
        <HighlightModule
        colors={this.props.colors}
        text={this.props.article.text}
        topics={this.props.topics}
        currentTopic={this.props.currentTopic}
        />
        </div>
      </div>
    );
  }

});

export default connect(
  mapStateToProps,
  null
  //mapDispatchToProps
)(Article);
