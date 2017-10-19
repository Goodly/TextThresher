import React from 'react';
import PropTypes from 'prop-types';

import { EditorState } from '../model/EditorState';
import { DisplayState } from '../model/DisplayState';

const debug = require('debug')('thresher:TextSpanner');

export class Spanner extends React.Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    editorState: PropTypes.instanceOf(EditorState).isRequired,
    displayState: PropTypes.instanceOf(DisplayState).isRequired,
    blockStyleFn: PropTypes.func.isRequired,
    customStyleMap: PropTypes.object.isRequired,
  }

  render() {
    const editorState = this.props.editorState;
    const displayState = this.props.displayState;
    const blockStyleFn = this.props.blockStyleFn;
    const text = editorState.getText();
    return (
      <div>
        {displayState.getBlockList().map( (block, i) => {
          const style = blockStyleFn(block, i);
          return (
            <div key={block.key}
                 style={style}
                 data-offset-start={block.start}
                 data-offset-end={block.end}>
              {text.substring(block.start, block.end)}
            </div>
          );
        })}
      </div>
    );
  }
}
