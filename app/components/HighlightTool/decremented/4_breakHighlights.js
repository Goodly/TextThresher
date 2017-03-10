import breakHighlights from '../breakHighlights';
import {mock_highlights} from '../mocks/mock_highlights';
import {mock_broken} from '../mocks/mock_broken';
var article = mock_highlights.article;
var h1 = mock_highlights.highlights.h1;
var h2 = mock_highlights.highlights.h2;
var h3 = mock_highlights.highlights.h3;
var h4 = mock_highlights.highlights.h4;
var h5 = mock_highlights.highlights.h5;
var h6 = mock_highlights.highlights.h6;

var h1_broken = mock_broken.highlights.h1;
var h2_broken = mock_broken.highlights.h2;
var h3_broken = mock_broken.highlights.h3;
var h4_broken = mock_broken.highlights.h4;
var h5_broken = mock_broken.highlights.h5;
var h6_broken = mock_broken.highlights.h6;




/*
Cases:
1. No highlights = no broken highlights
2. Single broken highlight = 2 broken highlights
3. two broken highlights = 4
4. three broken highlights = 6
Edge Cases:
*/
//console.log(h1)
//console.log(h2)

test('(breakHighlights: Case 1, Test 1) no highlights returns empty', () => {
  expect(breakHighlights([])).toEqual([]);
});

test('(breakHighlights: Case 2, Test 1) one highlight returns two breaks', () => {
  expect(breakHighlights([h1])).toEqual([h1_broken.start, h1_broken.end]);
});
//order: h1.start, h2.start, h1.end, h2.end
test('(breakHighlights: Case 3, Test 1) two highlight returns four breaks', () => {
  expect(breakHighlights([h1, h2])).toEqual([h1_broken.start, h2_broken.start, h1_broken.end, h2_broken.end]);
});
//order: h1.start, h3.start, h6.start, h1.end, h6.end, h3.end
test('(breakHighlights: Case 4, Test 1) three highlight returns six breaks', () => {
  expect(breakHighlights([h1, h3, h6])).toEqual([h1_broken.start, h3_broken.start, h6_broken.start, h1_broken.end, h6_broken.end, h3_broken.end]);
});
