var sampleData = {
    "tua": {
        "id": "42",
        "type": "protestor-initiated event",
        "instructions": "We may use this for custom instructions for the TUA type...",
        "offsets": [
            {
                "start": 2748,
                "stop": 3006
            }
        ]
    },

    "topics": [
        {
            "id": "1",
            "name": "event type",
            "questions": [
                {
                    "id": "1.1",
                    "top": true,
                    "text": "What type of event is described in the highlighted text?",
                    "type": "multiplechoice",
                    "answers": [
                        {
                            "id": "1.1.1",
                            "text": "March/Parade"
                        },
                        {
                            "id": "1.1.2",
                            "text": "Rally/Demonstration"
                        },
                        {
                            "id": "1.1.3",
                            "text": "Strike"
                        },
                        {
                            "id": "1.1.4",
                            "text": "Blocking Action"
                        },
                        {
                            "id": "1.1.5",
                            "text": "Establishing a Camp"
                        },
                        {
                            "id": "1.1.6",
                            "text": "Moving a Camp to a New Location"
                        },
                        {
                            "id": "1.1.7",
                            "text": "Disrupting an On-going Event of the Perceived 1%"
                        },
                        {
                            "id": "1.1.8",
                            "text": "Divestment Action"
                        },
                        {
                            "id": "1.1.9",
                            "text": "Voluntary Dissolution of a Camp"
                        },
                        {
                            "id": "1.1.10",
                            "text": "Strategic Violence"
                        },
                        {
                            "id": "1.1.11",
                            "text": "Strategic Sabotage"
                        }
                    ],
                    "dependencies": [
                        {
                            "if": "1.1.4",
                            "then": "1.2"
                        },
                        {
                            "if": "1.1.7",
                            "then": "1.3"
                        },
                        {
                            "if": "1.1.10",
                            "then": "1.5"
                        },
                        {
                            "if": "1.1.11",
                            "then": "1.6"
                        }
                    ]
                },
                {
                    "id": "1.2",
                    "top": false,
                    "text": "What did the crowd block?",
                    "type": "multiplechoice",
                    "answers": [
                        {
                            "id": "1.2.1",
                            "text": "Sidewalk"
                        },
                        {
                            "id": "1.2.2",
                            "text": "Street"
                        },
                        {
                            "id": "1.2.3",
                            "text": "Public Transportation"
                        },
                        {
                            "id": "1.2.4",
                            "text": "Airport"
                        },
                        {
                            "id": "1.2.5",
                            "text": "Shipping Port"
                        }
                    ],
                    "dependencies": []
                },
                {
                    "id": "1.3",
                    "top": false,
                    "text": "What type of event did the protesters disrupt?",
                    "type": "multiplechoice",
                    "answers": [
                        {
                            "id": "1.3.1",
                            "text": "Political Campaign"
                        },
                        {
                            "id": "1.3.2",
                            "text": "Politician's Speech"
                        },
                        {
                            "id": "1.3.3",
                            "text": "City Council Meeting"
                        },
                        {
                            "id": "1.3.4",
                            "text": "Auction"
                        }
                    ],
                    "dependencies": [
                        {
                            "if": "1.3",
                            "then": "1.4"
                        }
                    ]
                },
                {
                    "id": "1.4",
                    "top": false,
                    "text": "What is the position or title of the 1% who is being protested against?",
                    "type": "multiplechoice",
                    "answers": [
                        {
                            "id": "1.4.1",
                            "text": "CEO of some company"
                        },
                        {
                            "id": "1.4.2",
                            "text": "City Mayor"
                        },
                        {
                            "id": "1.4.3",
                            "text": "City Council Member"
                        },
                        {
                            "id": "1.4.4",
                            "text": "State Legislature"
                        },
                        {
                            "id": "1.4.5",
                            "text": "U.S. President"
                        }
                    ],
                    "dependencies": []
                },
                {
                    "id": "1.5",
                    "top": false,
                    "text": "What type of strategic violence occurred?",
                    "type": "multiplechoice",
                    "answers": [
                        {
                            "id": "1.5.1",
                            "text": "Kidnapping"
                        },
                        {
                            "id": "1.5.2",
                            "text": "Assassination"
                        },
                        {
                            "id": "1.5.3",
                            "text": "Bombing"
                        },
                        {
                            "id": "1.5.4",
                            "text": "Assault"
                        }
                    ],
                    "dependencies": []
                },
                {
                    "id": "1.6",
                    "top": false,
                    "text": "What type of strategic sabotage occurred?",
                    "type": "multiplechoice",
                    "answers": [
                        {
                            "id": "1.6.1",
                            "text": "Pre-planned vandalism"
                        },
                        {
                            "id": "1.6.2",
                            "text": "Pre-planned arson"
                        }
                    ],
                    "dependencies": []
                }
        ]},
        {
            "name":"event info (location, attendance, time/duration)",
            "questions":[
        ]},
        {
            "name": "arrests/injuries",
            "questions":[
        ]},
        {
            "name": "permit",
            "questions": [
        ]},
        {
            "name": "community response",
            "questions": [
        ]}
    ],

    "text": "BOSTON (AP) -- Gov. Deval Patrick visited the Occupy Boston protest for the first time Saturday and was greeted warmly by numerous supporters, but he was also trailed by a heckler who accused him of being part of the problem they were demonstrating against. [Gov. Deval Patrick visited the Occupy Boston protest for the first time Saturday and was greeted warmly by numerous supporters, but he was also trailed by a heckler who accused him of being part of the problem they were demonstrating against.]\n\nPatrick was dressed informally and accompanied by just a couple of staffers when he stopped by Dewey Square on the Rose F. Kennedy Greenway at about noon for what he described as a \"low-key\" visit. [ Dewey Square on the Rose F. Kennedy Greenway]\n\nProtest organizers showed him around the tent city, where a couple hundred people have camped [have camped] for about two weeks. The protesters have various causes, including speaking out against what they see as an unjust concentration of political and economic power in the hands of 1 percent at the expense of \"the 99 percent\" of the rest of the country.\n\n[Governor Deval] Patrick said his visit wasn't meant to convey any particular message.\n\n\"I'm just trying to understand,\" he said. \"There's such a range of issues and interests, and you can't get it all, necessarily, from the media.\"\n\nPatrick said the group appeared to represent views from across the political spectrum. \"The fact they are coming together, trying to find consensus on a few issues, is pretty darn exciting,\" he said.\n\nThe governor said he had no opinion on whether the protesters should be allowed to remain in the square indefinitely.\n\n\"It's not my issue,\" he said. \"I don't run the Greenway.\"\n\nAsked if he was worried about the extra expenses incurred by the group, for things such as police overtime, Patrick said, \"I know the mayor (Boston Mayor Thomas Menino) is concerned about that, but the mayor is also respectful of the interests of the people who are here.\"\n\nPatrick was greeted warmly by numerous protesters who thanked him for the visit, but he was also dogged by 43-year-old Barry Knight of Hartford, Tenn., who said he'd been part of Occupy Boston for more than a week.\n\nKnight repeatedly and loudly pointed out that Patrick, a wealthy former corporate executive, had a home worth millions of dollars.\n\n\"Deval Patrick is part of the 1 percent!\" he said as Patrick spoke nearby with others. \"He's no friend of anybody but himself! Deval Patrick is representing corporate America!\"\n\nPatrick said he had no response to Knight. When asked if he was part of the 1 percent, Patrick said, \"I think one message that's coming through here is we need to come together.\"\n\nThe governor's visit came a few hours before Occupy Boston members and other protesters marched from Park Street, near the Statehouse, to Dewey Square. The first part of the march was led by an anti-war coalition, but numerous other causes had their say, from pro-environment to anti-corporation groups.\n\nOne marcher, 27-year-old Amy Fisher, who works at a Boston restaurant, said she was alienated from politics and frustrated by a growing income gap in the country.\n\n\"I'm really sick of nothing happening to reduce income disparity,\" she said. \"I think it's going to just get worse and worse and worse until violence takes over.\"\n\n Jim Recht, 52, Massachusetts chairman of Physicians for a National Health Program, said his family's income put him in the top 2 percent of earners, but \"we believe we should be taxed more than we are now, and there should be a different distribution of resources.\"\n\nEric Payson, a volunteer for Ron Paul's presidential campaign, said he supported the anti-war part of the march but didn't back Occupy Boston because they're blaming corporations for numerous problems and not asking people to take personal responsibility.\n\nPayson, a 26-year-old Ashland resident, said the movement seemed untethered to any one political group.\n\n\"These people are kind of lost,\" he said. \"They don't really have a party.\"",

    "glossary": {
        "blocking action": "type of protester-initiated event where a group of individuals...",
        "camp": "a definition goes here",
        "community response": "a definition goes here",
        "counterprotester": "a definition goes here",
        "divestment action": "a definition goes here",
        "disrupting an on-going event of the perceived 1%": "a definition goes here",
        "establishing a camp": "a definition goes here",
        "independent": "a definition goes here",
        "injuries": "a definition goes here",
        "march/parade": "a type of protester-initiated event...",
        "moving a camp to a new location": "a definition goes here",
        "rally/demonstration": "a definition goes here",
        "strategic violence": "a definition goes here",
        "strategic sabotage": "a definition goes here",
        "strike": "a definition goes here",
        "voluntary dissolution of a camp": "a definition goes here"
    }
};

({
  // url: 'http://text-thresher.herokuapp.com/',

  // getArticleText: function() {
  //   $.get(this.url)
  //     .done(function (data) {
  //       console.log(data);
  //     });
  // },

  insertArticleText: function(data) {
    var offsets = data.tua.offsets[0],
        tua = '<strong>';

    tua += data.text.substring(offsets.start, offsets.stop);
    tua += '</strong>'

    $('.article-text').append(tua)
  },

  init: function() {
    // this.getArticleText();
    this.insertArticleText(sampleData);
  }
}).init();
