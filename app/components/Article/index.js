import React from 'react';
import { addHighlight } from 'actions/article';
import { connect } from 'react-redux';

//import 'text-highlighter/src/TextHighlighter';
import HighlightModule from 'components/highlight/highlighter';
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
    //let articleContainer = document.getElementById('article-container');
    //this.annotationsObject = new TextHighlighter(articleContainer);
  },

  serializeHighlights: function() {
    let highlightsString = this.annotationsObject.serializeHighlights();
    this.props.postArticleHighlights(highlightsString, this.props.article.article_id);
  },

  render() {
    var colors = ['rgb(241, 96, 97)', 'rgb(253, 212, 132)', 'rgb(175, 215, 146)', 'rgb(168, 210, 191)', 'rgb(255,153,000)', 'rgb(102,000,153)', 'rgb(000,153,153)', 'rgb(255,102,255)', 'rgb(000,051,153)', 'rgb(153,000,204)', 'rgb(70,194,64)', 'rgb(94,242,188)'];
    let article = this.props.article.article;
    var text = this.props.article.text;
  
    let fetchingClass = this.props.article.isFetching ? 'is-fetching' : '';
    return (
      <div className={`article ${fetchingClass}`}>
        <div className='article__header-text'>
        </div>
        <div ref={(ref) => this.articleRef = ref} id='article-container'>
        <HighlightModule
          text={text}
          topics={this.props.topics}
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
