import overlap from './overlap';
import merge from './merge';

/*
What the function is doing;
  - takes first highlight and checks if it overlaps with the next highlight
    - if it overlaps, then merge with current
    - else add current to merged and set the next highlight as current
*/
export default function mergeHighlights(highlights, text) {
  var merged = [];
  var current = highlights[0];
  var i = 1;
  var added = false;
  while (i < highlights.length) {
    var compare = highlights[i];
    if (overlap(current, compare) != true) {
      merged.push(current);
      current = compare;
      i += 1;
    } else {
      current = merge(current, compare, text);
      i += 1;
    }
  }
  merged.push(current);
  return merged;
}
