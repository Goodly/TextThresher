//import overlap from '../../../reducers/highlight';
//const reducer = require('../../../reducers/highlight');

function overlap(h1, h2) {
  if (h1.start <= h2.start && h1.end >= h2.end) {
    return true;
  } else if (h1.start <= h2.start && h1.end <= h2.end) {
    return true;
  } else if (h2.start <= h1.start && h2.end <= h1.end) {
    return true;
  } else {
    return false;
  }
}

var h1 = {
  "caseNum": 1,
  "end": 169,
  "start": 149,
  "text": "Brandishing homemade",
  "topic": 1
}
var h2 = {
  "caseNum": 1,
  "end": 175,
  "start": 161,
  "text": "homemade signs",
  "topic": 1
}
test('Takes in two highlights and tells whether they overlap or not', () => {
  expect(overlap(h1, h2)).toBe(true);
});
