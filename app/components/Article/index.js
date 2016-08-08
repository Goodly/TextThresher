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
         //selectedHighlight: state.article.selectedHighlight,
       };
}

const Article = React.createClass({
  displayName: 'Article',

  propTypes: {
    article: React.PropTypes.object.isRequired
  },

  componentDidMount: function() {
    let articleContainer = document.getElementById('article-container');
    //this.annotationsObject = new TextHighlighter(articleContainer);
  },

  serializeData: function() {
    return this.props.Highlight.highlights;
  },

  render() {
    //let article = this.props.article.article;
    //var text = this.props.article.text;

    let fetchingClass = this.props.article.isFetching ? 'is-fetching' : '';
    var colors =['rgb(241, 96, 97)', 'rgb(253, 212, 132)', 'rgb(175, 215, 146)', 'rgb(168, 210, 191)', 'rgb(255,153,000)', 'rgb(102,000,153)', 'rgb(000,153,153)', 'rgb(255,102,255)', 'rgb(000,051,153)', 'rgb(153,000,204)', 'rgb(70,194,64)', 'rgb(94,242,188)'];
    console.log('article props')
    console.log(this.props)
    return (
      <div className={`article ${fetchingClass}`}>
        <div className='article__header-text'>
          Please skim the text below and highlight words about the Topics listed in the margins.
        </div>
        <div id='article-container' className='article'>
        <HighlightModule
        colors={colors}
        text={this.props.article.text} //Hard copy of text that goes unchanged
        topics={this.props.topics} //Using to adapt merge-colors properly
        currentTopic={this.props.currentTopic} //Needs current from outside
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
