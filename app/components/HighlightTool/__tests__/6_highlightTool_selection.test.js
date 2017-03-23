import HighlightTool from '../highlightTool';
import {mock_highlights} from '../mocks/mock_highlights';
import {mock_broken} from '../mocks/mock_broken';
import {shallow, mount} from 'enzyme';
import {test_window} from '../global_window';
import { clearHighlights } from 'actions/highlight.js';

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
  highlights={[h5]}
  selectedHighlight={[1]}
  clearHighlights={clearHighlights}
  />
);
//selected is start-end pair
/*test('Clear highlights', () => {
  // clearHighlights returns an unbound action that isn't dispatched
  var action = wrapper.instance().clearHighlights();
  console.log(action)
  //expect(wrapper.instance().props.highlights).toEqual([]);
});*/
test('Returns highlights', () => {
  expect(wrapper.instance().returnHighlights()).toEqual([h5]);
});
