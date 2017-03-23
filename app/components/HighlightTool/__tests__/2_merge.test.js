import merge from '../merge';
import {mock_highlights} from '../mocks/mock_highlights';
var article = mock_highlights.article;
var h1 = mock_highlights.highlights.h1;
var h2 = mock_highlights.highlights.h2;
var h3 = mock_highlights.highlights.h3;
var h4 = mock_highlights.highlights.h4;
var h5 = mock_highlights.highlights.h5;
var h6 = mock_highlights.highlights.h6;

/*
5 cases:
1. h1 "engulfs" h2
2. h2 "engulfs" h1
3. h1 left-overlaps h2
4. h2 left-overlaps h1
5. no overlaps, throw error
6. not same topic, throw error
*/

test ('(Merge: Case 1, Test 1) h1 "engulfs" h2', () => {
  expect(merge(h3, h4, article)).toEqual(h3);
});
test ('(Merge: Case 2, Test 1) h2 "engulfs" h1', () => {
  expect(merge(h4, h3, article)).toEqual(h3);
});
test ('(Merge: Case 3, Test 1) h1 left-overlaps h2', () => {
  expect(merge(h1, h2, article)).toEqual(h3);
});
test ('(Merge: Case 4, Test 1) h2 left-overlaps h1', () => {
  expect(merge(h2, h1, article)).toEqual(h3);
});
test ('(Merge: Case 5, Test 1) no overlaps, throw error', () => {
  expect(merge(h5, h4, article)).toThrowError();
});
/*test ('(Merge: Case 6, Test 1) different topics, throw error', () => {
  expect(merge(h3, h6, article)).toThrow();
});*/
