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
    blockPropsFn: PropTypes.func,
    mergeStyleFn: PropTypes.func,
    wrapSpanFn: PropTypes.func,
  }

  static defaultProps = {
    blockPropsFn: ((block, sequence_number) => {}),
    mergeStyleFn: ((orderedLayers) => {}),
    wrapSpanFn: ((span) => span)
  };

  render() {
    const editorState = this.props.editorState;
    const displayState = this.props.displayState;
    const blockPropsFn = this.props.blockPropsFn;
    const mergeStyleFn = this.props.mergeStyleFn;
    const wrapSpanFn = this.props.wrapSpanFn;
    const text = editorState.getText();

    function renderSpans(block) {
      let spans = editorState.getSpans(block);
      return (spans.map( (span, i) => {
        let orderedLayers = displayState.getOrderedLayersFor(span.spanAnnotations);
        let mergedStyle = mergeStyleFn(orderedLayers);
        let titleList = orderedLayers.map( (ola) => ola.annotation.topicName );
        let title = titleList.join(', ');
        return (wrapSpanFn(
          <span key={span.key}
                data-offset-start={span.start}
                data-offset-end={span.end}
                style={mergedStyle}
                title={title}>
            {text.substring(span.start, span.end)}
          </span>,
          orderedLayers
        ));
      }));
    };

    function renderBlock(block, i) {
      const mergeProps = blockPropsFn(block, i);
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
