import mergeHighlights from '../mergeHighlights';
import {mock_highlights} from '../mocks/mock_highlights';
import {mock_merged} from '../mocks/mock_merged';


var article = mock_highlights.article;
var h1 = mock_highlights.highlights.h1;
var h2 = mock_highlights.highlights.h2;
var h3 = mock_highlights.highlights.h3;
var h4 = mock_highlights.highlights.h4;
var h5 = mock_highlights.highlights.h5;
var h6 = mock_highlights.highlights.h6;
var h7 = mock_highlights.highlights.h7;
var h8 = mock_highlights.highlights.h8;
var h9 = mock_highlights.highlights.h9;
var h10 = mock_highlights.highlights.h10;
var h11 = mock_highlights.highlights.h11;
var h12 = mock_highlights.highlights.h12;

var h13 = mock_highlights.highlights.h13;
var h14 = mock_highlights.highlights.h14;
var h15 = mock_highlights.highlights.h15;
var h16 = mock_highlights.highlights.h16;
var h17 = mock_highlights.highlights.h17;
var h18 = mock_highlights.highlights.h18;
var h19 = mock_highlights.highlights.h19;
var h20 = mock_highlights.highlights.h20;
var h21 = mock_highlights.highlights.h21;
var h22 = mock_highlights.highlights.h22;
var h23 = mock_highlights.highlights.h23;




var m_h1 = mock_merged.h1;
var m_h2 = mock_merged.h2;
var m_h3 = mock_merged.h3;
var m_h4 = mock_merged.h4;


/*var custom_case = [
  {
    "caseNum":1 ,
    "end": 29,
    "start": 7,
    "text": "Wall Street supporters",
    "topic": 13,
  },
  {
    "caseNum": 1,
    "end": 377,
    "start": 12,
    "text": "Street supporters gather in Albany                                ↵November 05, 2011 7:30 am↵By Steve Lathrop, Albany Democrat-Herald↵↵↵↵Brandishing homemade signs and waving at passing  cars, more than 60 people supporting the Occupy Wall Street movement lined up  in downtown Albany late Friday afternoon to deliver their message.↵About five counter-demonstrators" ,
    "topic":13 ,
  },
  {
    "caseNum": 1,
    "end": 91,
    "start": 19,
    "text": "supporters gather in Albany                                ↵November 05,",
    "topic": 7,
  },
  {
    "caseNum": 1,
    "end": 96,
    "start": 88,
    "text": "05, 2011",
    "topic": 13,
  },
  {
    "caseNum": 1,
    "end": 129,
    "start": 114,
    "text": "Lathrop, Albany",
    "topic": 7,
  },
];*/



/*
mergeHighlights:
  1. Pass in two overlapping highlights, output should be single merged highlight
  2. Pass in five separate highlights and a sixth highlight of the same topic that spans all of them, expect a single merged highlight
  3. Same set up as 2 but the sixth highlight is a different topic, expect six highlights
*/


test('(mergeHighlights: Case 1, Test 1) two overlapping highlights are merged', () => {
  expect(mergeHighlights([h1, h2], article)).toEqual([m_h1]);
});
//*****
test('(mergeHighlights: Case 1, Test 2) two overlapping highlights are merged correctly despite other surrounding (but not overlapping) highlights', () => {
  expect(mergeHighlights([h1, h8, h9], article)).toEqual([h1, m_h2]);
});
test('(mergeHighlights: Case 1, Test 3) another test for two overlapping highlights', () => {
  expect(mergeHighlights([h9, h8], article)).toEqual([m_h2]);
});
test('(mergeHighlights: Case 1, Test 4) another test for two overlapping highlights', () => {
  expect(mergeHighlights([h9, h8], article)).toEqual([m_h2]);
});
//*****
test('(mergeHighlights: Case 1, Test 5) another test for two overlapping highlights with additional surrounding highlights', () => {
  expect(mergeHighlights([h1, h2, h8], article)).toEqual([m_h1, h8]);
});
test('(mergeHighlights: Case 2, Test 1) three overlaps should be merged into one', () => {
  expect(mergeHighlights([h1, h2, h4], article)).toEqual([h3]);
});
test('(mergeHighlights: Case 3, Test 1) three highlights with two separate overlaps that should be merged into one', () => {
  expect(mergeHighlights([h3, h9, h8], article)).toEqual([h12]);
});
test('(mergeHighlights: Case 4, Test 1) five highlights with two separate overlaps that should be merged into one', () => {
  expect(mergeHighlights([h1, h2, h3, h9, h8], article)).toEqual([h12]);
});
test('(mergeHighlights: Very Complicated Example that throws everything in - 10 overlaps that it needs to sort out)', () => {
  expect(mergeHighlights([h13, h14, h15, h16, h17, h18, h19, h20, h21, h22, h23], article)).toEqual([m_h3, m_h4]);
});
/*test('(mergeHighlights: Custom Case, highlight right to left over several lines and there is an earlier highlight of the same topic (currently does not create highlight))', () => {
  expect(mergeHighlights(custom_case, article)).toEqual([]);
});
*/
