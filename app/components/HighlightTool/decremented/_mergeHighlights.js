import overlap from './overlap';
import merge from './merge';

/*
What the function is doing;
  - takes first highlight and checks if it overlaps with the next highlight
    - if it overlaps, then merge with current
    - else add current to merged and set the next highlight as current
*/
/*export default function mergeHighlights(highlights, text) {
  console.log("Look for highlight order here")
  console.log(highlights)
  var merged = [];
  var current = highlights[0];
  var i = 1;
  var added = false;
  //Must check all merged and current for overlaps

  while (i < highlights.length) {
    console.log("CURRENT")
    console.log(current)
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

  console.log("FINAL MERGED")
  console.log(merged)
  return merged;
}*/

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
