import overlap from '../overlap';
import {mock_highlights} from '../mocks/mock_highlights';
var article = mock_highlights.article;
var h1 = mock_highlights.highlights.h1;
var h2 = mock_highlights.highlights.h2;
var h3 = mock_highlights.highlights.h3;
var h5 = mock_highlights.highlights.h5;
var h6 = mock_highlights.highlights.h6;

test('(Overlap: Case 1, Test 1) h1 overlaps h2', () => {
  expect(overlap(h1, h2)).toBe(true);
});
test('(Overlap: Case 2, Test 1) h2 overlaps h1', () => {
  expect(overlap(h2, h1)).toBe(true);
});
test('(Overlap: Case 3, Test 1) h1 does not overlap h2', () => {
  expect(overlap(h5, h6)).toBe(false);
});
test('(Overlap: Case 4, Test 1) h1 overlaps h2 but is not the same topic', () => {
  expect(overlap(h3, h6)).toBe(false);
});
