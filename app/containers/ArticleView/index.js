import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as articleViewActions from 'actions/articleView';
import fetchArticleView from 'django/articleView';

import { displayStates } from 'components/displaystates';
import { colors } from 'utils/colors';
import Color from 'color';

import { Spanner,
         EditorState,
         makeOffsetsFromLineBreaks,
         makeBlocksFromOffsets,
       } from 'components/TextSpanner';
import { sortLayersByTopicAndCase } from 'model/TopicLabel';
import { loadAnnotatedArticle } from './convertToSpanner';
import { ArticleMetaData } from 'components/ArticleMetaData';
import { Slider } from 'components/Slider';
import { Pager } from 'components/Pager';

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
    this.fetchArticles = this._fetchArticles.bind(this);
    this.setIndex = this._setIndex.bind(this);
    this.state = {article_index: 0};
    this.cache = new Map();
    this.colorCache = new ConsistentColors();
  }

  _setIndex(article_index) {
    this.setState({article_index: article_index});
  }

  _fetchArticles(url_to_fetch_articles) {
     this.setIndex(0);
     fetchArticleView(this.props, url_to_fetch_articles);
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
          loadAnnotatedArticle(editorState, article);
          let blocks = makeBlocksFromOffsets(makeOffsetsFromLineBreaks(article.text));
          displayState.setDisplayBlocks(blocks);
          this.cache.set(article_id, {editorState, displayState});
        };
        let layers = editorState.getLayers();
        layers.sort(sortLayersByTopicAndCase);
        debug(sortLayersByTopicAndCase);
        debug(layers);
        displayState.setDisplayLayers(layers);
        // TODO: Render layer list
        return (
          <div className="article-viewer">
            <Slider
              index={this.state.article_index}
              values={article_ids}
              onChange={(evt) => {
                this.setIndex(Number(evt.target.value));
              }}
            />
            <Pager result={db.result} fetchArticles={this.fetchArticles} />
            <ArticleMetaData metadata={article.metadata} />
            <div className="article-click-box">
              <Spanner
                editorState={editorState}
                displayState={displayState}
                blockPropsFn={getBlockProps}
                mergeStyleFn={this.colorCache.getStyleFn}
                wrapSpanFn={wrapSpan}
              />
            </div>
          </div>
        );
    };
  };
};

class ConsistentColors {
  constructor() {
    this.getStyleFn = this._getStyleFn.bind(this);
    this.getTopicColor = this._getTopicColor.bind(this);
    this.topicColors = new Map();
    this.nextColorIndex = 0;
  }

  _getTopicColor(topicName) {
    if (this.topicColors.has(topicName)) {
      return this.topicColors.get(topicName);
    } else {
      let color = colors[this.nextColorIndex];
      this.nextColorIndex = (this.nextColorIndex + 1) % colors.length;
      this.topicColors.set(topicName, color);
      return color;
    };
  }

  _getStyleFn(orderedLayers) {
    // orderedLayers is an array of objects with keys:
    // {order, layer, annotation}
    let style = {};
    let bgColor = Color('white');
    if (orderedLayers.length >= 1)  {
      let topicName = orderedLayers[0].layer.layerLabel.topicName;
      let bgColor = Color(this.getTopicColor(topicName));
      if (bgColor.dark()) {
        bgColor = bgColor.fade(0.5);
      };
      style = Object.assign(style, {
        backgroundColor: bgColor.rgb().string(),
      });
    };
    if (orderedLayers.length >= 2)  {
      let topicName = orderedLayers[1].layer.layerLabel.topicName;
      let color2 = Color(this.getTopicColor(topicName));
      style = Object.assign(style, {
        borderBottomStyle: 'solid',
        borderBottomWidth: '3px',
        borderBottomColor: color2.rgb().string(),
      });
    };
    if (orderedLayers.length >= 3)  {
      let topicName = orderedLayers[2].layer.layerLabel.topicName;
      let color3 = Color(this.getTopicColor(topicName));
      style = Object.assign(style, {
        borderTopStyle: 'solid',
        borderTopWidth: '3px',
        borderTopColor: color3.rgb().string(),
      });
    };
    return style;
  };
}

function wrapSpan(reactSpan, orderedLayers) {
  let titleList = orderedLayers.map( (ola) => {
    return ola.annotation.source.shortLabel();
  });
  titleList = titleList.filter( (topicName) => topicName !== '' );
  let title = titleList.join(', ');
  return React.cloneElement(reactSpan, {
    title,
  });
}

// sequence_number can be used for even/odd styling...
function getBlockProps(block, sequence_number) {
  let props = {};
  switch (block.blockType) {
    case 'unstyled': {
      if (sequence_number % 2) {
        props['style'] = { backgroundColor: 'whitesmoke' };
      } else {
        props['style'] = { backgroundColor: 'white' };
      };
    }
  }
  return props;
}
