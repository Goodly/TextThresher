import {merge, overlap, mergeHighlights } from '../../../reducers/highlight';
var article = "Occupy Wall Street supporters gather in Albany                                ↵November 05, 2011 7:30 am↵By Steve Lathrop, Albany Democrat-Herald↵↵↵↵Brandishing homemade signs and waving at passing  cars, more than 60 people supporting the Occupy Wall Street movement lined up  in downtown Albany late Friday afternoon to deliver their message.↵About five counter-demonstrators were also on hand with signs asking for relief of their tax burden and occasionally debating with individuals from the larger group.↵The demonstration was peaceful and larger than Edith Orner, one of the organizers, expected.↵“I thought we would get 50 so this is good,” she said.↵One of those on hand was Nancy Rose-Chism of Albany.↵“A lot of people here are retired, or unemployed or students,” she said, “but I’m not any of those. I wanted to lend my voice to taking back our money and our government.”↵Rose-Chism said she was looking for a way to be a part of the growing movement and turned to the Internet.↵“I searched for an Occupy Albany site and found this,” she said. “I’m one of the 99 percent.”↵So she made her own sign and joined the rally.↵According to Orner, many people found out about the demonstration the same way. She said the idea got started among a small group of people who meet once a week. About a week ago they decided to do something in support of the Occupy movements.↵“We just said let’s get on that and we put something together as quickly as we could,” Orner said.↵That meant placing posters around Albany, and using social networking, emails and the telephone.↵It seemed to work. By 5 p.m. the crowd had swelled to almost 70.↵Those at the rally lined up on all four corners of Fourth and Ellsworth showing their signs to passing traffic and pedestrians. Orner said the idea was to demonstrate for about an hour.↵“Our concern is what’s going on with the economy,” she said. “We don’t want to reduce the deficit on the backs of those who need (the money) most.”↵Rose-Chism said she wanted to be part of something that was trying to make things better for the majority of the people.↵“I believe this is what most of the people want,” she said.↵No plans for additional demonstrations are in the works now, but that could change.↵“We may have a follow-up discussion of some sort,” Orner said. “We want to be part of doing what we can for the greater good.”↵http://democratherald.com/news/local/occupy-wall-street-supporters-gather-in-albany/article_9cae0258-0743-11e1-bc5f-001cc4c002e0.html";

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
var h4 = {
  "caseNum": 1,
  "end": 175,
  "start": 149,
  "text": "Brandishing homemade signs",
  "topic": 6
}
var h5 = {
  "caseNum": 1,
  "end": 204,
  "start": 170,
  "text": "signs and waving at passing  cars,",
  "topic": 1
}
var h6 = {
  "caseNum": 1,
  "end": 235,
  "start": 210,
  "text": "than 60 people supporting",
  "topic": 1
}
var h7 = {
  "caseNum": 1,
  "end": 214,
  "start": 170,
  "text": "signs and waving at passing  cars, more than",
  "topic": 1
}
var h8 = {
  "caseNum": 1,
  "end": 289,
  "start": 149,
  "text": "Brandishing homemade signs and waving at passing  cars, more than 60 people supporting the Occupy Wall Street movement lined up  in downtown",
  "topic": 1
}
var h9 = {
  "caseNum": 1,
  "end": 235,
  "start": 170,
  "text": "signs and waving at passing  cars, more than 60 people supporting",
  "topic": 1
}

test('Overlap Test 1', () => {
  expect(overlap(h1, h2)).toEqual(true);
});
test('Overlap Test 2', () => {
  expect(overlap(h2, h5)).toEqual(true);
});
test('Overlap Test 3', () => {
  expect(overlap(h1, h5)).toEqual(false);
});
test('mergeHighlights Test 1', () => {
  expect(mergeHighlights([h1, h2], article)).toEqual([h3]);
});
