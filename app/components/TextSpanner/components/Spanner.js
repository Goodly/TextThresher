import React from 'react';
import PropTypes from 'prop-types';

import { EditorState, DisplayState } from '../model/EditorState';

const debug = require('debug')('thresher:TextSpanner');

export class Spanner extends React.Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    editorState: PropTypes.instanceOf(EditorState),
    displayState: PropTypes.instanceOf(DisplayState),
    blockStyleFn: PropTypes.func.isRequired,
    customStyleMap: PropTypes.object.isRequired,
  }

  render() {
    const editorState = this.props.editorState;
    const text = editorState.getText();
    return (
      <div>
        {editorState.getBlockList().map( (block) => {
          return (
            <div key={block.key}>
              {text.substring(block.start, block.end)}
            </div>
          );
        })}
      </div>
    );
  }
}
