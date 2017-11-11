import { QuizLayerLabel, QuizLayerTypes } from 'model/QuizLayerLabel';

const debug = require('debug')('thresher:TextSpanner');

export function loadTopicHighlights(editorState, topic_highlights) {
  let layerLabel = new QuizLayerLabel({
    layerType: QuizLayerTypes.TOPIC,
  });
  let layer = editorState.createLayerState(layerLabel);
  topic_highlights.forEach( (hg) => {
    hg.offsets.forEach( (offset) => {
      layer.addAnnotation({
        topicName: hg.topic_name,
        topicOrder: hg.topic_order,
        caseNumber: hg.case_number,
        start: offset[0],
        end: offset[1],
        extra: {textShouldBe: offset[2]},
      });
    });
  });
  return editorState;
}

export function loadHints(editorState, hint_offsets) {
  let layerLabel = new QuizLayerLabel({
    layerType: QuizLayerTypes.HINT,
  });
  let layer = editorState.createLayerState(layerLabel);
  hint_offsets.offsets.forEach( (offset) => {
    layer.addAnnotation({
      topicName: hint_offsets.hint_type,
      start: offset[0],
      end: offset[1],
      extra: {textShouldBe: offset[2]},
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
      layer.addAnnotation({
        answer_id: offset.topic,
        start: offset.start,
        end: offset.end,
        extra: {textShouldBe: text.substring(offset.start, offset.end)},
      });
    };
  });
  return editorState;
};
