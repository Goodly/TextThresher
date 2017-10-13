import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { displayStates } from 'components/displaystates';
import * as articleViewActions from 'actions/articleView';
import { Spanner, EditorState } from 'components/TextSpanner';
import { convertToSpanner } from './convertToSpanner';

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
        let text;
        let editorState = EditorState.createEmpty();
        let displayState = editorState.createDisplayState();
        if (db && db.entities && db.entities.articles) {
          text = db.entities.articles[article_id].text;
          editorState = convertToSpanner(article_id, db);
        };
        return (
          <div className="article-viewer">
            <div className="article-click-box">
              <Spanner
                editorState={editorState}
                displayState={displayState}
                blockStyleFn={getBlockStyle}
                customStyleMap={styleMap}>
                {text}
              </Spanner>
            </div>
          </div>
        );
    };
  };
};

const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
};

// adapt this for even-odd styling of sentences...
function getBlockStyle(block) {
  switch (block.getType()) {
    case 'div': return 'some-css-style';
    default: return null;
  }
}
