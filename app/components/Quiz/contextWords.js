const re_whitespace = /\s+/;

export const EXTRA_WORDS = 12;
export const SPECIAL_DISP_ID = 5000;

// Given an article and a highlight string, add up to extraWords on both sides
export function contextWords(article, offset, extraWords) {
  var start = offset[0];
  var end = offset[1];
  var highlighted = article.substring(start, end);
  if (highlighted.toLowerCase() != offset[2].toLowerCase()) {
    console.log("Bad offsets. Looking for '"+offset[2]+"'. Found '"+highlighted+"'");
  };
  var before = article.substring(0, start).split(re_whitespace).slice(-extraWords);
  var after = article.substring(end).split(re_whitespace, extraWords);
  return [before.join(' '), highlighted, after.join(' ')];
}

// Find the hints for this question_id
export function getQuestionHints(question_id, hints) {
  for (var i = 1; i < hints.length; i++) {
    if (hints[i].question == question_id) {
      return hints[i];
    };
  };
  return {offsets: []}
}
