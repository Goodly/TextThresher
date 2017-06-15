const re_whitespace = /\s+/;

export const EXTRA_WORDS = 12;
export const SPECIAL_DISP_ID = 5000;

// Given an article and a highlight string, add up to extraWords on both sides
export function contextWords(article, offset, extraWords) {
  var highlighted = article.substring(offset[0], offset[1]);
  if (highlighted.toLowerCase() != offset[2].toLowerCase()) {
    console.log("Bad offsets. Looking for '"+offset[2]+"'. Found '"+highlighted+"'");
  };
  // Parser sending sometimes sends bad offsets, so re-locate within article.
  highlighted = offset[2];
  var start = article.indexOf(highlighted);
  if (start == -1) {
    console.log("Highlighted text not in article: '"+highlighted+"'");
    return ["", highlighted, ""];
  };
  var end = start + highlighted.length;
  var before = article.substring(0, start).split(re_whitespace).slice(-extraWords);
  var after = article.substring(end).split(re_whitespace, extraWords);
  return [before.join(' '), highlighted, after.join(' ')];
}

// Abridge the article based on the topic highlights, and recalc the
// offsets needed to annotate the original highlights and hints.
// Since we are abridging the text, we have to adjust the offsets
// for the annotations (highlights and hints) to match the
// abridged text.
// TODO: The highlighter should be refactored to take care of abridging.
export function getAnnotatedText(article, topic_highlights, hint_type, hint_sets_for_article) {
  var abridged = '';
  for (let i = 0; i < topic_highlights.length; i++) {
    var triplet = contextWords(article, topic_highlights[i], EXTRA_WORDS);
    abridged += '...' + triplet.join(' ') + '...';
  };
  // TODO: Select the hint set indicated by hint_type.
  // Adjust offsets to match abridged version of article.
  // For now, use the hint feature to show the topic_highlights
  var hints_offsets = abridgeHintOffsets(article, topic_highlights);
  return { abridged: abridged, hints_offsets: hints_offsets };
};

// This hacky hack can certainly be replaced with a much more elegant
// computation by merging it into getAnnotatedText() above
export function abridgeHintOffsets(article, offsets) {
  var hints_offsets = [];
  var text = '';
  offsets.forEach(function (offset) {
    var triplet = contextWords(article, offset, EXTRA_WORDS);
    var fromIndex = text.length;
    text += '...' + triplet.join(' ') + '...';
    var start = text.indexOf(offset[2], fromIndex);
    if (start != -1) {
      var end = start + offset[2].length;
      hints_offsets.push([start, end, offset[2]]);
    };
  });
  return hints_offsets;
};

export function getAnswerAnnotations(answer_colors) {
  // answer_colors is a Map from answer.id to an object like:
  // { answerColor: 'rgb(241,96,97)' }
  // This perfectly useful map has to be converted to parallel arrays
  // for use by Highlighter
  var color_array = [];
  var answer_ids = [];
  for (let [answer_id, color] of answer_colors) {
      answer_ids.push({ id: answer_id });
      color_array.push(color);
  };

  return { color_array, answer_ids };
};
