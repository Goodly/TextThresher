import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { displayStates } from 'components/displaystates';
import * as articleViewActions from 'actions/articleView';
import { Spanner, EditorState } from 'components/TextSpanner';
import { loadAnnotatedArticle, displayLinesAsBlocks } from './convertToSpanner';
import { ArticleMetaData } from 'components/ArticleMetaData';
import { ArticleSlider } from 'components/ArticleSlider';
import { colors } from 'utils/colors';

const debug = require('debug')('thresher:ArticleView');

import './styles.scss';

const mapStateToProps = state => {
  return {
    database: state.articleView.database,
    displayState: state.articleView.displayState,
    error: state.articleView.error,
  };
}

@connect (
  mapStateToProps,
  dispatch => bindActionCreators(articleViewActions, dispatch)
)
export class ArticleView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {article_index: 0};
    this.cache = new Map();
  }

  render() {
    if (this.props.error) {
      let e = this.props.error;
      return (
        <div>
          {e.name}: {e.message}
        </div>
      );
    };
    switch (this.props.displayState) {
      case displayStates.BEFORE_LOAD:
        return (
          <div>
            {this.props.children}
          </div>
        );
      case displayStates.TASK_LOADED:
        let db = this.props.database;
        let article_ids = this.props.database.result.results;
        let article_id = article_ids[this.state.article_index];
        let article = db.entities.articles[article_id];
        let editorState = EditorState.createEmpty();
        let displayState = editorState.createDisplayState();
        if (this.cache.has(article_id)) {
          let cache = this.cache.get(article_id);
          editorState = cache.editorState;
          displayState = cache.displayState;
        } else {
          editorState = loadAnnotatedArticle(editorState, article_id, db);
          displayState = displayLinesAsBlocks(displayState, article_id, db);
          this.cache.set(article_id, {editorState, displayState});
        };
        // Add un-ordered layers from editorState to displayState ordered list
        displayState.setDisplayLayers(editorState.getLayers());
        // TODO: Render layer list
        return (
          <div className="article-viewer">
            <ArticleSlider
              article_index={this.state.article_index}
              article_ids={article_ids}
              onChange={(evt) => {
                this.setState({article_index: evt.target.value});
              }}
            />
            <ArticleMetaData metadata={article.metadata} />
            <div className="article-click-box">
              <Spanner
                editorState={editorState}
                displayState={displayState}
                blockPropsFn={getBlockProps}
                mergeStyleFn={getStyleFn}
              />
            </div>
          </div>
        );
    };
  };
};

function getStyleFn(orderedLayers) {
  // orderedLayers is an array of objects with keys:
  // {order, layer, annotation}
  let style = {};
  if (orderedLayers.length >= 1) {
    style = Object.assign(style, {
      backgroundColor: colors[orderedLayers[0].order],
    });
  }
  if (orderedLayers.length >= 2)  {
    style = Object.assign(style, {
      borderStyle: 'solid',
      borderWidth: '1px',
      borderColor: 'red',
    });
  };
  if (orderedLayers.length >= 3)  {
    style = Object.assign(style, {
      color: 'white',
    });
  };
  return style;
};

// sequence_number can be used for even/odd styling...
function getBlockProps(block, sequence_number) {
  let props = {};
  switch (block.blockType) {
    case 'unstyled': {
      if (sequence_number % 2) {
        props['style'] = { backgroundColor: 'lightgray' };
      } else {
        props['style'] = { backgroundColor: 'white' };
      };
    }
  }
  return props;
}
