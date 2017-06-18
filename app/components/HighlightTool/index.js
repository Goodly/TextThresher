import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import HighlightTool from './highlightTool';
import * as highlightActionCreators from 'actions/highlight'
import './styles.scss';

const assembledActionCreators = Object.assign({}, highlightActionCreators);

const mapStateToProps = state => {
  return {
    highlights: state.highlight.highlights,
    selectedHighlight: state.highlight.selectedHighlight
  };
}

export default connect(
  mapStateToProps,
  dispatch => bindActionCreators(assembledActionCreators, dispatch)
)(HighlightTool);
