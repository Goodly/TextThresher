export default function merge(h1, h2, text) {
  if (h1.topic == h2.topic) {
    if (h1.start <= h2.start && h1.end >= h2.end) {
      var h = {
        "caseNum": h1.caseNum,
        "end": h1.end,
        "start": h1.start,
        "text": h1.text,
        "topic": h1.topic
      }

      return h;
    } else if (h2.start <= h1.start && h2.end >= h1.end) {
      var h = {
        "caseNum": h2.caseNum,
        "end": h2.end,
        "start": h2.start,
        "text": h2.text,
        "topic": h2.topic
      }

      return h;
    } else if (h1.start <= h2.start && h1.end <= h2.end && h1.end >= h2.start) {
      var h = {
        "caseNum": h1.caseNum,
        "end": h2.end,
        "start": h1.start,
        "text": text.slice(h1.start, h2.end),
        "topic": h1.topic
      }

      return h;
    } else if (h2.start <= h1.start && h2.end <= h1.end && h2.end >= h2.start) {
      var h = {
        "caseNum": h2.caseNum,
        "end": h1.end,
        "start": h2.start,
        "text": text.slice(h2.start, h1.end),
        "topic": h2.topic
      }

      return h;
    } else {
      throw Error("merge method error: no overlap");
    }
  } else {
    throw Error("merge method error: topic not equal");
  }
}
