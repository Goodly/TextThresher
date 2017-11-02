const debug = require('debug')('thresher:TextSpanner');

export function loadAnnotatedArticle(editorState, article) {
  editorState = editorState.setText(article.text);
  article.highlight_taskruns.forEach( (taskrun) => {
    taskrun.highlights.forEach( (hg) => {
      let layer = editorState.createLayerState({
        contributor: taskrun.contributor.unique_label,
        topicName: hg.topic_name,
        caseNumber: hg.case_number,
      });
      hg.offsets.forEach( (offset) => {
        layer.addAnnotation({
          contributor: taskrun.contributor.unique_label,
          topicName: hg.topic_name,
          caseNumber: hg.case_number,
          start: offset[0],
          end: offset[1],
          extra: {textShouldBe: offset[2]},
        });
      });
    });
  });
  return editorState;
}
