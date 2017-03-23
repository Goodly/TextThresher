import overlap from './overlap';
import merge from './merge';

export default function mergeHighlights(highlights, text) {
  var merged = [];
  var i = 0;
  while (i < highlights.length) {
    var compare = highlights[i];
    var found_overlap = false;
    for(var x = 0; x < merged.length; x++) {
      var m = merged[x];
      if (overlap(m, compare) == true) {
        found_overlap = true;
        merged[x] = merge(m, compare, text);
        merged = mergeHighlights(merged, text);
        break;
      }
    }
    if (found_overlap == false) {
      merged.push(compare);
    }
    i += 1;
  }

  return merged;
}
