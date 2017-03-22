import HighlightTool from '../highlightTool';
import {mock_highlights} from '../mocks/mock_highlights';
import {mock_broken} from '../mocks/mock_broken';
import {shallow, mount} from 'enzyme';
import {test_window} from '../global_window';
//import test_window from '../global_window';

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



//import { colors } from 'utils/colors';import { shallow, render, mount } from 'enzyme';
import React from 'react';

var colors = [
  "rgb(241,96,97)",
  "rgb(253,212,132)",
  "rgb(175,215,146)",
  "rgb(168,210,191)",
  "rgb(255,153,000)",
  "rgb(102,000,153)",
  "rgb(000,153,153)",
  "rgb(255,102,255)",
  "rgb(000,051,153)",
  "rgb(153,000,204)",
  "rgb(70,194,64)",
  "rgb(94,242,188)"
];
var topics = [
  {
    "glossary" : {
      "major event": "A major event."
    },
    "id": 1,
    "instructions": "Highlight the text that describes the following topic.",
    "name": "Events",
    "order": null
  }, {
    "glossary": {
      "major event": "A major event."
    },
    "id": 5,
    "instructions": "This topic includes all information describing police-initiated events/activities like raiding encampments, surveilling encampments, issuing warnings, offering press statements, and more. If words and phrases are describing police behavior, and the behavior is NOT a direct response to some Protester-Initiated Event (See ‘Protest’ topic), highlight the text as the ‘Police’ topic. EXCLUDE any details about what protesters are doing in their encampments unless protesters’ actions are responding to police-initiated behavior at the encampment. Such protester behavior at camps is covered by the ‘Camp’ topic. EXCLUDE any information about planned or future events. Such information is covered by the ‘Future’ topic.",
    "name": "Police",
    "order": null
  }
]
var currentTopicId = 1;

const wrapper = shallow(
  <HighlightTool
  text={article}
  topics={topics}
  colors={colors}
  currentTopicId={currentTopicId}
  highlights={[]}
  selectedHighlight={[1]}
  />
);

test('(breakHighlights: Case 1, Test 1) no highlights returns empty', () => {
  expect(wrapper.instance().breakHighlights([])).toEqual([]);
});

test('(breakHighlights: Case 1, Test 1) no highlights returns empty', () => {
  expect(wrapper.instance().breakHighlights([])).toEqual([]);
});

test('(breakHighlights: Case 2, Test 1) one highlight returns two breaks', () => {
  expect(wrapper.instance().breakHighlights([h1])).toEqual([h1_broken.start, h1_broken.end]);
});
//order: h1.start, h2.start, h1.end, h2.end
test('(breakHighlights: Case 3, Test 1) two highlight returns four breaks', () => {
  expect(wrapper.instance().breakHighlights([h1, h2])).toEqual([h1_broken.start, h2_broken.start, h1_broken.end, h2_broken.end]);
});
//order: h1.start, h3.start, h6.start, h1.end, h6.end, h3.end
test('(breakHighlights: Case 4, Test 1) three highlight returns six breaks', () => {
  expect(wrapper.instance().breakHighlights([h1, h3, h6])).toEqual([h1_broken.start, h3_broken.start, h6_broken.start, h1_broken.end, h6_broken.end, h3_broken.end]);
});
/*
processhighlights Cases:
1. single highlight with space to left
2. single highlight at very beginning
3. single highlight at very end
4. two separate highlights, same topic
5. two separate highlights, different topics
6. two overlapping highlights, different topics
7. three overlapping highlights, different topics
*/

/*test('(processHighlights: Case 1, single highlight with space to left)', () => {
  expect(wrapper.instance().processHighlights()).toEqual();
});
test('(processHighlights: Case 1, single highlight at very beginning)', () => {
  expect(wrapper.instance().processHighlights()).toEqual();
});
test('(processHighlights: Case 1, single highlight at very end)', () => {
  expect(wrapper.instance().processHighlights()).toEqual();
});
test('(processHighlights: Case 1, two separate highlights, same topic)', () => {
  expect(wrapper.instance().processHighlights()).toEqual();
});
test('(processHighlights: Case 1, two separate highlights, different topic )', () => {
  expect(wrapper.instance().processHighlights()).toEqual();
});
test('(processHighlights: Case 1, )', () => {
  expect(wrapper.instance().processHighlights()).toEqual();
});
test('(processHighlights: Case 1, )', () => {
  expect(wrapper.instance().processHighlights()).toEqual();
});*/
/*
wordCorrection Cases:
Version for r to l and l to r:
1. left word hang
2. right word hang
3. left and right hang
4. multiple word, left word hang
5. multi word, right word hang
6. multi word, both
*/
test('(processHighlights: Case 1, hang left one word, r to l)', () => {
  expect(wrapper.instance().wordCorrection(82, 87)).toEqual([79, 87]);
});
test('(processHighlights: Case 1, hang left one word, l to r)', () => {
  expect(wrapper.instance().wordCorrection(87, 82)).toEqual([79, 87]);
});

test('(processHighlights: Case 2, hang right one word, r to l)', () => {
  expect(wrapper.instance().wordCorrection(84, 87)).toEqual([79, 87]);
});
test('(processHighlights: Case 2, hang right one word, l to r)', () => {
  expect(wrapper.instance().wordCorrection(87, 84)).toEqual([79, 87]);
});

test('(processHighlights: Case 3, hang right and left one word, r to l)', () => {
  expect(wrapper.instance().wordCorrection(81, 84)).toEqual([79, 87]);
});
test('(processHighlights: Case 3, hang right and left one word, l to r)', () => {
  expect(wrapper.instance().wordCorrection(81, 84)).toEqual([79, 87]);
});

test('(processHighlights: Case 4, hang left multiple words, r to l )', () => {
  expect(wrapper.instance().wordCorrection(81, 104)).toEqual([79, 104]);
});
test('(processHighlights: Case 4, hang left multiple words, l to r )', () => {
  expect(wrapper.instance().wordCorrection(104, 81)).toEqual([79, 104]);
});
test('(processHighlights: Case 5, hang right multiple words, r to l )', () => {
  expect(wrapper.instance().wordCorrection(79, 103)).toEqual([79, 104]);
});
test('(processHighlights: Case 5, hang right multiple words, l to r )', () => {
  expect(wrapper.instance().wordCorrection(103, 79)).toEqual([79, 104]);
});

test('(processHighlights: Case 6, hang right and left multiple words, r to l )', () => {
  expect(wrapper.instance().wordCorrection(156, 183)).toEqual([149, 186]);
});
test('(processHighlights: Case 6, hang right and left multiple words, l to r )', () => {
  expect(wrapper.instance().wordCorrection(183, 156)).toEqual([149, 186]);
});


test('(processHighlights: Case 7, hang at beginning of article, r to l)', () => {
  expect(wrapper.instance().wordCorrection(1, 6)).toEqual([0, 6]);
});
test('(processHighlights: Case 7, hang at beginning of article, l to r)', () => {
  expect(wrapper.instance().wordCorrection(6, 1)).toEqual([0, 6]);
});

/*
handleClick Cases:
1. newest highlight is selected
2. newest highlight is added
3. highlight at very beginning works
4. highlight at very end works
*/

/*
handleKeyDown Cases:
*/
