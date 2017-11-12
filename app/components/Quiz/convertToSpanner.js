import { QuizLayerLabel, QuizLayerTypes } from 'model/QuizLayerLabel';

const debug = require('debug')('thresher:TextSpanner');

export function loadTopicHighlights(editorState, topic_highlights) {
  let layerLabel = new QuizLayerLabel({
    layerType: QuizLayerTypes.TOPIC,
  });
  let layer = editorState.createLayerState(layerLabel);
  topic_highlights.forEach( (hg) => {
    let source = new QuizLayerLabel({
      layerType: QuizLayerTypes.TOPIC,
      topicName: hg.topic_name,
      topicNumber: hg.topic_number,
      caseNumber: hg.case_number,
    });
    hg.offsets.forEach( (offset) => {
      layer.addAnnotation({
        start: offset[0],
        end: offset[1],
        text: offset[2],
        source,
      });
    });
  });
  return editorState;
}

export function loadHints(editorState, hint_offsets) {
  let layerLabel = new QuizLayerLabel({
    layerType: QuizLayerTypes.HINT,
    hintType: hint_offsets.hint_type,
  });
  let layer = editorState.createLayerState(layerLabel);
  hint_offsets.offsets.forEach( (offset) => {
    layer.addAnnotation({
      start: offset[0],
      end: offset[1],
      text: offset[2],
      source: layerLabel,
    });
  });
  return editorState;
}

export function loadWorkingHighlights(editorState, highlights,
                                      reviewMode, answer_id) {
  let layerLabel = new QuizLayerLabel({
    layerType: QuizLayerTypes.ANSWER,
  });
  let text = editorState.getText();
  let layer = editorState.createLayerState(layerLabel);
  highlights.forEach( (offset) => {
    if (reviewMode === false || offset.topic === answer_id) {
      let source = new QuizLayerLabel({
        layerType: QuizLayerTypes.ANSWER,
        answer_id: offset.topic,
      });
      layer.addAnnotation({
        start: offset.start,
        end: offset.end,
        text: text.substring(offset.start, offset.end),
        source,
      });
    };
  });
  return editorState;
};
