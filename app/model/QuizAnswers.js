import { QuizLayerLabel, QuizLayerTypes } from 'model/QuizLayerLabel';

const debug = require('debug')('thresher:QuizAnswers');

export class QuizAnswers {
  constructor(editorState) {
    this._editorState = editorState;
    this._answerHighlightLayers = new Map();
    this._selectedAnnotations = new Map();
  }

  addHighlight(answer_id, new_highlight) {
    let layer = null;
    if ( ! this._answerHighlightLayers.has(answer_id)) {
      let layerLabel = new QuizLayerLabel({
        layerType: QuizLayerTypes.ANSWER,
        answer_id,
      });
      layer = this._editorState.createLayerState(layerLabel);
      this._answerHighlightLayers.set(answer_id, layer);
    } else {
      layer = this._answerHighlightLayers.get(answer_id);
    };
    layer.addAnnotation({
      start: new_highlight.start,
      end: new_highlight.end,
      text: new_highlight.text,
      source: layer.layerLabel,
    });
  }

  deleteHighlight(answer_id, annotation_key) {
  }
}
