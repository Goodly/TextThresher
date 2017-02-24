//import { colors } from 'utils/colors';import { shallow, render, mount } from 'enzyme';
import React from 'react';
import {shallow} from 'enzyme';
import TestUtils from "react-addons-test-utils";
import HighlightTool from "../index";
import configureStore from 'redux-mock-store';
import {mock_highlights} from '../mocks/mock_highlights';

import sinon from 'sinon';
const mockStore = configureStore();
const dispatch = sinon.spy();

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
console.log("Before test");
/*const highlighter = shallow(
  <HighlightTool
  dispatch={dispatch}
  store={mockStore({ runtime: {} })}
  text={article}
  topics={topics}
  colors={colors}
  highlights={[h1, h5]}
  currentTopicId={currentTopicId}
  />);*/
let renderer = TestUtils.createRenderer();
console.log("after renderer")
renderer.render(<HighlightTool
dispatch={dispatch}
store={mockStore({ runtime: {} })}
text={article}
topics={topics}
colors={colors}
highlights={[h1, h5]}
currentTopicId={currentTopicId}
/>);
console.log("after render")

var wrapper = renderer.getRenderOutput();
console.log("after shallow")
console.log(wrapper)
//console.log(highlighter.instance())


test('(highlightTool.processHighlights: Case 1 Test 1)', () => {
  console.log("Testing console")

  it("Test1", () => {
    expect(highlighter.instance().processHighlights([h1, h5]).toEquals());
  });
});
