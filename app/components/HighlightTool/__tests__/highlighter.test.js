//import { colors } from 'utils/colors';
import { shallow, render, mount } from 'enzyme';
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

import HighlightTool from "../index";
var article = "Occupy Wall Street supporters gather in Albany                                ↵November 05, 2011 7:30 am↵By Steve Lathrop, Albany Democrat-Herald↵↵↵↵Brandishing homemade signs and waving at passing  cars, more than 60 people supporting the Occupy Wall Street movement lined up  in downtown Albany late Friday afternoon to deliver their message.↵About five counter-demonstrators were also on hand with signs asking for relief of their tax burden and occasionally debating with individuals from the larger group.↵The demonstration was peaceful and larger than Edith Orner, one of the organizers, expected.↵“I thought we would get 50 so this is good,” she said.↵One of those on hand was Nancy Rose-Chism of Albany.↵“A lot of people here are retired, or unemployed or students,” she said, “but I’m not any of those. I wanted to lend my voice to taking back our money and our government.”↵Rose-Chism said she was looking for a way to be a part of the growing movement and turned to the Internet.↵“I searched for an Occupy Albany site and found this,” she said. “I’m one of the 99 percent.”↵So she made her own sign and joined the rally.↵According to Orner, many people found out about the demonstration the same way. She said the idea got started among a small group of people who meet once a week. About a week ago they decided to do something in support of the Occupy movements.↵“We just said let’s get on that and we put something together as quickly as we could,” Orner said.↵That meant placing posters around Albany, and using social networking, emails and the telephone.↵It seemed to work. By 5 p.m. the crowd had swelled to almost 70.↵Those at the rally lined up on all four corners of Fourth and Ellsworth showing their signs to passing traffic and pedestrians. Orner said the idea was to demonstrate for about an hour.↵“Our concern is what’s going on with the economy,” she said. “We don’t want to reduce the deficit on the backs of those who need (the money) most.”↵Rose-Chism said she wanted to be part of something that was trying to make things better for the majority of the people.↵“I believe this is what most of the people want,” she said.↵No plans for additional demonstrations are in the works now, but that could change.↵“We may have a follow-up discussion of some sort,” Orner said. “We want to be part of doing what we can for the greater good.”↵http://democratherald.com/news/local/occupy-wall-street-supporters-gather-in-albany/article_9cae0258-0743-11e1-bc5f-001cc4c002e0.html";

//import HighlightTool.parseHighlights as parseHighlights;

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
var h3 = {
  "caseNum": 1,
  "end": 175,
  "start": 149,
  "text": "Brandishing homemade signs",
  "topic": 1
}

var h_parsed = [
  {type: 'start', index: h1.start, topic: h1.topic, source: h1, selected: false},
  {type: 'end', index: h1.end, topic: h1.topic, source: h1, selected: false}
]

//test('HighlightTool: parseHighlight test 1', () => {
//  expect(HighlightTool.parseHighlights([h1])).toEqual(h_parsed);
//});

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

it('should render a document title', () => {
    const wrapper = shallow(
        <HighlightTool
        text={article}
        topics={topics}
        colors={colors}
        currentTopicId={currentTopicId}
        />
    );
    expect(wrapper.instance().parseHighlights([h1])).toEqual(h_parsed);
});
