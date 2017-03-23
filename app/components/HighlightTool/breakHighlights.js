export default function breakHighlights(highlights) {
  console.log("BREAKHIGHLIGHTS INPUT")
  console.log(highlights)


  var parsedHighlights = [];
  var temp_index = 0;
  while (temp_index < highlights.length) {
    var i = highlights[temp_index];
    var start = {type: 'start', index: i.start, topic: i.topic, source: i, selected: false};
    var end = {type: 'end', index: i.end, topic: i.topic, source: i, selected: false};
    parsedHighlights.push(start);
    parsedHighlights.push(end);
    temp_index += 1;
  }

  parsedHighlights.sort((a,b) => {
    return a.index - b.index;
  });
  console.log("BREAKHIGHLIGHTS OUTPUT")
  console.log(parsedHighlights)
  return parsedHighlights;
}
