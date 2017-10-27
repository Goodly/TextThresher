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
    mergeStyleFn: PropTypes.func.isRequired,
  }

  render() {
    const editorState = this.props.editorState;
    const displayState = this.props.displayState;
    const blockPropsFn = this.props.blockPropsFn;
    const mergeStyleFn = this.props.mergeStyleFn;
    const text = editorState.getText();

    function renderSpans(block) {
      let spans = editorState.getSpans(block);
      return (spans.map( (span, i) => {
        let orderedLayers = displayState.getOrderedLayersFor(span.spanAnnotations);
        let mergedStyle = mergeStyleFn(orderedLayers);
        let titleList = orderedLayers.map( (ola) => ola.annotation.topicName );
        let title = titleList.join(', ');
        // TODO: Set a good key
        return (
          <span key={i}
                data-offset-start={span.start}
                data-offset-end={span.end}
                style={mergedStyle}
                title={title}>
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
          {renderSpans(block)}
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
