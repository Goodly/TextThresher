const debug = require('debug')('thresher:TextSpanner');

export function convertToSpanner(editorState, article_id, database) {
  let article = database.entities.articles[article_id];
  editorState.setText(article.text);
  let start = 0;
  let end = article.text.length;
  let depth = 0;
  editorState.addBlock('unstyled', start, end, depth, {});
  return editorState;
}
