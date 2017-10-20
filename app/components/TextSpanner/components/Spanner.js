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
    blockPropsFn: PropTypes.func.isRequired,
    customStyleMap: PropTypes.object.isRequired,
  }

  render() {
    const editorState = this.props.editorState;
    const displayState = this.props.displayState;
    const blockPropsFn = this.props.blockPropsFn;
    const text = editorState.getText();
    editorState.generateCharacterClasses(displayState);

    function renderSpans(start, end) {
      let spans = editorState.getSpans(displayState, start, end);
      return (spans.map( (span, i) => {
        let classNames = span.spanLayers.join(' ');
        return (
          <span key={i} className={classNames} title={classNames}>
            {text.substring(span.start, span.end)}
          </span>
        );
      }));
    };

    function renderBlock(block, i) {
      const mergeProps = blockPropsFn(block, i);
      /* if block.hasChildren() {

         }
      */
      return React.cloneElement(
        <div key={block.key}
             data-offset-start={block.start}
             data-offset-end={block.end}>
          {renderSpans(block.start, block.end)}
        </div>,
        mergeProps
      );
    };

    return (
      <div>
        {displayState.getBlockList().map( (block, i) => {
          return renderBlock(block, i);
        })}
      </div>
    );
  }
}
