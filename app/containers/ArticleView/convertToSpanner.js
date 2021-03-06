import { TopicLabel } from 'model/TopicLabel';

const debug = require('debug')('thresher:TextSpanner');

export function loadAnnotatedArticle(editorState, article) {
  editorState = editorState.setText(article.text);
  article.highlight_taskruns.forEach( (taskrun) => {
    taskrun.highlights.forEach( (hg) => {
      let layerLabel = new TopicLabel({
        contributor: taskrun.contributor.unique_label,
        topicName: hg.topic_name,
        topicNumber: hg.topic_number,
        caseNumber: hg.case_number,
      });
      let layer = editorState.createLayerState(layerLabel);
      hg.offsets.forEach( (offset) => {
        layer.addAnnotation({
          start: offset[0],
          end: offset[1],
          text: offset[2],
          source: layerLabel,
        });
      });
    });
  });
}
