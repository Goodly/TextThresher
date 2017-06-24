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

// Abridge the article based on the topic highlights.
// TODO: The highlighter should be refactored to take care of abridging.
// Recalc the offsets needed to annotate the original highlights and hints.
// Since we are abridging the text, we have to adjust the offsets for
// the annotations (highlights and hints) to match the abridged text.
// On the plus side, this algorithm fixes bad offsets.
export function abridgeText(article, highlights, hints) {
  let abridged = '';
  let abridged_highlights = [];
  let abridged_hints = [];
  highlights.forEach(function (offset) {
    const triplet = contextWords(article, offset, EXTRA_WORDS);
    const fromIndex = abridged.length;
    const tripletText = triplet.join(' ');
    abridged += '...' + tripletText + '...';
    const start = abridged.indexOf(offset[2], fromIndex);
    if (start !== -1) {
      const end = start + offset[2].length;
      abridged_highlights.push([start, end, offset[2]]);
      const charsBeforeHighlight = triplet[0].length + 1;
      const charsAfterHighlight = triplet[2].length + 1;
      const srcTripletStart = offset[0] - charsBeforeHighlight;
      const destTripletStart = start - charsBeforeHighlight;
      hints.forEach( (offset) => {
        const hintStart = abridged.indexOf(offset[2], 0);
        if (hintStart !== -1) {
          abridged_hints.push([hintStart, hintStart + offset[2].length, offset[2]]);
        };
      });
    };
  });
  return { abridged, abridged_highlights, abridged_hints };
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
