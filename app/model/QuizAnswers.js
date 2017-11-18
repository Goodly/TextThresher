import { QuizLayerLabel, QuizLayerTypes } from 'model/QuizLayerLabel';

const debug = require('debug')('thresher:QuizAnswers');

/* As a design pattern, this is a decorator (facade?) that wraps
 * an EditorState instance.
 * We want to manage highlights grouped by answer_ids, but we
 * don't want to pollute the TextSpanner EditorState model with that
 * kind of domain specific knowledge. That's why the LayerState and
 * Annotation models allow domain specific Label objects for tracking
 * annotation meta-data.
 * This class adds and deletes highlights using maps keyed on answer_ids,
 * but also keeps the highlights in sync in the underlying editorState.
 * Note that the underlying editorState may be managing numerous other
 * layers (such as topic highlights and hints), that we don't
 * want to affect.
 */
export class QuizAnswers {
  constructor(editorState) {
    this._editorState = editorState;
    this._answerHighlightLayers = new Map();
    this._selectedAnnotations = new Map();
    this.addHighlight = this.addHighlight.bind(this);
    this.hasAnswer = this.hasAnswer.bind(this);
    this.getAnswerAnnotations = this.getAnswerAnnotations.bind(this);
    this.selectHighlight = this.selectHighlight.bind(this);
    this.highlightSelected = this.highlightSelected.bind(this);
    this.deleteSelection = this.deleteSelection.bind(this);
  }

  addHighlight(answer_id, new_highlight, question_id, question_number) {
    let layer = null;
    if ( ! this._answerHighlightLayers.has(answer_id)) {
      let layerLabel = new QuizLayerLabel({
        layerType: QuizLayerTypes.ANSWER,
        answer_id,
        question_id,
        question_number,
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

  hasAnswer(answer_id) {
    return this._answerHighlightLayers.has(answer_id);
  }

  getAnswerAnnotations(answer_id) {
    const layer = this._answerHighlightLayers.get(answer_id);
    const annotations = layer.getAnnotationList();
    let serializable = annotations.map( (anno) => {
      let {start, end, text} = anno;
      return {start, end, text, answer_id};
    });
    return serializable;
  }

  selectHighlight(annotation) {
    this._selectedAnnotations.clear();
    this._selectedAnnotations.set(annotation.key, annotation);
  }

  highlightSelected(annotation_key) {
    return this._selectedAnnotations.has(annotation_key);
  }

  deleteSelection() {
    for (let annotation of this._selectedAnnotations.values()) {
      let answer_id = annotation.source.answer_id;
      let layer = this._answerHighlightLayers.get(answer_id);
      layer.deleteAnnotation({key: annotation.key});
    }
    this._selectedAnnotations.clear();
  }
}
