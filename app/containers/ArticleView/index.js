import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { displayStates } from 'components/displaystates';
import * as articleViewActions from 'actions/articleView';
import { Spanner, EditorState } from 'components/TextSpanner';
import { loadAnnotatedArticle, displayLinesAsBlocks } from './convertToSpanner';
import { colors } from 'utils/colors';

import './styles.scss';

const mapStateToProps = state => {
  return {
    database: state.articleView.database,
    article_id: state.articleView.database.result,
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
        let article_id = this.props.article_id;
        let editorState = EditorState.createEmpty();
        let displayState = editorState.createDisplayState();
        if (db && db.entities && db.entities.articles) {
          let text = db.entities.articles[article_id].text;
          editorState = loadAnnotatedArticle(editorState, article_id, db);
          displayState = displayLinesAsBlocks(displayState, article_id, db);
        };
        // Add un-ordered layers from editorState to displayState ordered list
        displayState.setDisplayLayers(editorState.getLayers());
        // TODO: Render layer list
        return (
          <div className="article-viewer">
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
