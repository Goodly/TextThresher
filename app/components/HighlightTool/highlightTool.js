import React from 'react';
import overlap from './overlap';
import mergeHighlights from './mergeHighlights';
import HandleEnd from './Handles/HandleEnd';
import HandleStart from './Handles/HandleStart';

// This routine gets alternating runs of unhighlighted
// and highlighted text. We have to take a set of annotations and
// insert them into the stream we are getting.
// In both cases, we are given the offsets into the text passed
// to the highlighter. For the case of Quiz abridged texts,
// the passed in offsets must already match the abridged article.
function getHintedText(text, start, end, hints_offsets) {
  var subtext = text.substring(start, end);
  if ( ! Array.isArray(hints_offsets)) {
    return subtext;
  };
  var output = [];
  hints_offsets = hints_offsets.slice(); // Make a copy
  hints_offsets = hints_offsets.sort( (a,b) => (a[0] - b[0]) )
  // We are not supposed to get overlapping hints, so proceed
  // with that simplifying assumption.
  hints_offsets.forEach(function (offset) {
    var hintStart = offset[0];
    var hintEnd = offset[1];
    var mark = start;
    if (hintStart <= start && hintEnd > start) {
      mark = Math.min(hintEnd, end);
      output.push(
        <b key={String(start)+'.'+String(mark)}>
          {text.substring(start, mark)}
        </b>
      );
      start = mark;
    };
    if (hintStart >= start && hintStart <= end) {
      mark = hintStart;
      output.push(text.substring(start, mark));
      start = mark;
      mark = Math.min(hintEnd, end);
      output.push(
        <b key={String(start)+'.'+String(mark)}>
          {text.substring(start, mark)}
        </b>
      );
      start = mark;
    };
  });
  if (start < end) {
    output.push(text.substring(start, end));
  };
  return output;
}

function getOffset(node, targetNode, result={done: false,
                                             articleText: false,
                                             offset: 0}) {
  // Recursive algorithm - passed in result must not be mutated
  result = Object.assign({}, result);
  if (result.done === true) {
    return result;
  }
  if (node === targetNode) {
    result.done = true;
    return result;
  }
  if (node.nodeName === "SPAN" && node.className === "articleText") {
    result.articleText = true;
  }
  if (node.nodeName === "#text" && result.articleText === true) {
    result.offset += node.nodeValue.length;
  }

  for (var i=0; i < node.childNodes.length; i++) {
    result = getOffset(node.childNodes[i], targetNode, result);
  }

  if (node.nodeName === "SPAN" && node.className === "articleText") {
    result.articleText = false;
  }
  return result;
};

const HighlightTool = React.createClass({
  displayName: 'HighlightTool',

  propTypes: {
    text: React.PropTypes.string.isRequired,
    topics: React.PropTypes.array.isRequired,
    highlights: React.PropTypes.array.isRequired,
    currentTopicId: React.PropTypes.number.isRequired,
    selectedHighlight: React.PropTypes.array.isRequired,
    colors: React.PropTypes.array.isRequired,
    hints_offsets: React.PropTypes.array,
  },

  /*
  Domain: current stored highlight objects
  Range: highlight-like objects that describe each text span

  1. Takes the current highlights and breaks each into a start and end object,
  2. Sorts the objects by their index in the text,
  3. Creates a new highlight-like object for each segment between objects. These
  objects will describe the spans that the render function creates. Each will have
  its own combination of topics according to its overlap,
  4. Checks if span has been selected, if so changes selected property to True
  5. Activates or deactivates topics based on whether the object describes the
  start of a highlight or the end of one
  6. Activates or deactivates source highlights (the highlights the span is representing)
  7. returns a list of span-objects with the same properties as highlight, which is passed
  into render.

  No alterations were made to render or to the article reducer - all
  this method does is reinterpret stored highlights so that render returns
  distinct spans that appear to be overlapping
  */


  /*
  parseHighlights: Breaks highlights into start and end points, then sorts them
  */
  breakHighlights: function(highlights) {
    var parsedHighlights = [];
    var temp_index = 0;
    while (temp_index < highlights.length) {
      var i = highlights[temp_index];
      var start = {type: 'start', index: i.start, topic: i.topic, source: i, selected: false};
      var end = {type: 'end', index: i.end, topic: i.topic, source: i, selected: false};
      parsedHighlights.push(start);
      parsedHighlights.push(end);
      temp_index += 1;
    }
    parsedHighlights.sort((a,b) => {
      return a.index - b.index;
    });
    return parsedHighlights;
  },

  processHighlights: function(highlights) {
    var parsedHighlights = this.breakHighlights(highlights);

    //Track which topics are active - activeTopic indices corresponds to this.props.topics indices
    var activeTopics = [];
    var topic_list = [];
    for (i=0; i<this.props.topics.length; i++) {
      activeTopics.push(false);
      topic_list.push(this.props.topics[i].id)
    }

    var final = [];
    var activeSources = [];
    var activeSelect = false;
    var start = 0;
    var end = 0;
    var temp_index = 0;
    var selectedHighlights = this.props.selectedHighlight;
    //iterate through all parsedhighlights
    while (temp_index < parsedHighlights.length) {

      var i = parsedHighlights[temp_index];
      //processed = highlight 'piece' that corresponds to individual overlap spans
      //initialize highlight overlap span
      var processed = {
        start: null,
        end: null,
        topics: [],
        source: activeSources.slice(0),
        selected: false,
        handleRight: null
      };

      if (i.type === 'start') {
        processed.handleRight = {
          type: 'start',
          source: i.source
        }
      } else {
        processed.handleRight = {
          type: 'end',
          source: i.source
        }
      }

      //end of last is start of next
      processed.start = start;
      processed.end = i.index;

      // (4) checks if ranges overlap
      if (selectedHighlights.length) {
        var select_index = 0;
        //check if the highlight is selected, if selected change field in processed
        while (select_index < selectedHighlights.length) {
          var selected_high = selectedHighlights[select_index]
          //Case for Single Highlight
          if ((selected_high[0] == processed.start) && (selected_high[1] == processed.end)) {
            processed.selected = true;
            break;
          } else if ((selected_high[0] < processed.start) && (processed.start < selected_high[1])) {
            processed.selected = true;
            break;
          } else if ((selected_high[0] < processed.end) && (processed.end < selected_high[1])) {
            processed.selected = true;
            break;
          }
          select_index += 1;
        }
      }
      // Add processed span to final
      start = i.index;
      var list_index = 0;
      while (list_index < activeTopics.length) {
        if (activeTopics[list_index]) {
          processed.topics.push(topic_list[list_index]);
        }
        list_index += 1;
      }
      final = final.concat(processed);

      // (5) Activate/Deactivate Topics, activate topics will lead to different color scheme
      var active_state = i.type === 'start';
      for(index=0;index<activeTopics.length;index+=1) {
        if (i.topic == topic_list[index]) {
          activeTopics[index] = active_state;
        }
      }
      // (6) Activate/Deactivate Sources

      if (active_state){
        var active = {start: i.source.start, end: i.source.end, text: i.source.text, top: i.source.topic, source: i.source};
        activeSources = activeSources.concat([active]);
      } else {
        var active = {start: i.source.start, end: i.source.end, text: i.source.text, top: i.source.topic, source: i.source};
        var source_index = -1;
        var index = 0;
        if (activeSources){
          while (index < activeSources.length) {
            var s = activeSources[index];
            if (s.start == active.start && s.end == active.end) {
              source_index = index;
              break;
            }
            index += 1;
          }
        }
        activeSources.splice(source_index, 1);
      }
      temp_index += 1;
    }
    return final;
  },
  /*
  Domain: List of Topics
  Range: String RGB

  From list of topics, merges colors to produce a "middle" value
  Take topics, find the number, generate that many colors
  */
  mergeColors: function(topics, selected) {
    var list = [];
    var index = 0;
    var colors = this.props.colors;
    for (var current=0;current<topics.length;current+=1) {
      for (var master=0;master<this.props.topics.length;master+=1){
        if (topics[current] == this.props.topics[master].id) {
          list.push(this.props.colors[master]);
        }
      }
    }

    var fraction = 1 / list.length;
    var red = 0;
    var blue = 0;
    var green = 0;
    index = 0;
    while (index < list.length) {
      var rgb = list[index].replace(/[^\d,]/g, '').split(',');
      red += fraction * Number(rgb[0]);
      green += fraction * Number(rgb[1]);
      blue += fraction * Number(rgb[2]);
      index += 1;
    }
    var opacity = 0.5;
    if (selected) {
      opacity = 1;
    }
    if (list.length == 0) {
      return 'rgba(255, 255, 255, 0)';
    }
    return 'rgba(' + Math.round(red) + ', ' + Math.round(green) + ', ' + Math.round(blue) + ', ' + opacity +')';
  },

  wordCorrection: function(start, end) {
    end -= 1;
    if (start > end) {
      var temp = start;
      start = end;
      end = temp;
    }
    var start_char = this.props.text[start];
    var end_char = this.props.text[end];
    var start_empty = ((start_char == ' ') || (start_char == '\t') || (start_char == '\n') || (start_char == undefined));
    var end_empty = ((end_char == ' ') || (end_char == '\t') || (end_char == '\n') || (end_char == undefined));

    var start_correction = start;
    var end_correction = end;

    var edit = start_correction;
    while (((start_char == ' ') || (start_char == '\t') || (start_char == '\n') || (start_char == undefined)) == start_empty) {
      if (start_empty) {
        start_correction += 1;
        edit = start_correction;
      } else {
        start_correction = edit;
        edit -= 1;
      }
      start_char = this.props.text[edit];
    }

    edit = end_correction;
    while (((end_char == ' ') || (end_char == '\t') || (end_char == '\n') || (end_char == undefined)) == end_empty) {
      // want to keep start_correction at one step before and start_char at one space ahead
      // not equal direction. If moving from text to space, previous step
      // if moving from space to text, include step that cut out
      if (end_empty) {
        end_correction -= 1;
        edit = end_correction;
      } else {
        end_correction = edit;
        edit += 1;
      }
      end_char = this.props.text[edit]
    }
    return [start_correction, end_correction+1];
  },

  clearHighlights: function() {
    this.props.clearHighlights();
  },

  returnHighlights: function() {
    return this.props.highlights;
  },


  handleClick: function() {
    var currentTopicId = this.props.currentTopicId;
    var selectionObj = window.getSelection();
    if (selectionObj.anchorOffset == selectionObj.extentOffset) {
      return;
    }
    if (selectionObj) {
      let selectedText = selectionObj.toString();
      var start = selectionObj.anchorOffset;
      var end = selectionObj.extentOffset;
      var anchor = selectionObj.anchorNode;
      var extent = selectionObj.extentNode;

      // Determine the actual start and end from the beginning
      // of the displayed text.
      var anchorResult = getOffset(this.articleRef, anchor);
      start += anchorResult.offset;
      var extentResult = getOffset(this.articleRef, extent);
      end += extentResult.offset;

      var editStart = 0;
      var editEnd = 0;
      for (var i = 0; i < this.props.highlights.length; i++) {
        var h = this.props.highlights[i];
        if (start > h.start) {
          editStart += 2;
        }

        if (start > h.end) {
          editStart += 2;
        }

        if (end > h.start) {
          editEnd += 2;
        }

        if (end > h.end) {
          editEnd += 2;
        }
      }
      start -= editStart;
      end -= editEnd;
      var ends = this.wordCorrection(start, end);
      start = ends[0];
      end = ends[1];

      if (start > end) {
        var temp = start;
        start = end;
        end = temp;
      }

      var new_text = this.props.text.slice(start, end);
      if (start !== end) {
        this.props.deselectHighlight();
        // Reducer does a merge...does not factor in caseNum
        this.props.addHighlight(start, end, new_text, currentTopicId, this.props.text);
        var newHighlight = {
            start,
            end,
            text: new_text,
            topic: currentTopicId,
            caseNum: 1
        };
        // Now another merge pass?
        var j = 0;
        while (j < this.props.highlights.length) {
          if (overlap(newHighlight, this.props.highlights[j])) {
            var new_highlight = mergeHighlights([newHighlight, this.props.highlights[j]], this.props.text);
            start = new_highlight[0].start;
            end = new_highlight[0].end;
            new_text = new_highlight[0].text
            newHighlight = new_highlight[0];
          }
          j+=1;
        }

        var select_highlight = {start, end, text:new_text, topic:currentTopicId};
        this.props.selectHighlight([select_highlight]);
      }
    }
    //removes selection after creating highlight
    window.getSelection().removeAllRanges();
  },

  componentDidMount: function() {
    document.addEventListener('keydown',this.handleKeyDown);
  },

  handleKeyDown: function(e) {
    // Don't steal backspace and delete key from input elements!
    if (document.activeElement.nodeName === "INPUT") {
      return;
    };
    if (e.keyCode == 46 || e.keyCode == 8) {
      if (this.props.selectedHighlight) {
        if (this.props.selectedHighlight.length > 0) {
          this.props.deleteHighlight(this.props.selectedHighlight);
        }
      }
    }
  },

  handleSelect: function(source, e) {
    if (source.length != 0) {
      this.props.selectHighlight(source);
    }
  },

  handleCase: function(source, e, i) {
    var newCase = source.caseNum + i;
    if (newCase == 0) {
      newCase = 1;
    }
    this.props.changeCaseHighlight(source, newCase);
  },

  render() {
    var text = this.props.text;
    var highlights = this.processHighlights(this.props.highlights) || [];
    var start = 0;
    var tail = '';
    var l = highlights.length;
    if (l === 0) {
      tail = text;
    } else if (highlights[l - 1].end !== text.length) {
      tail = text.substring(highlights[l - 1].end, text.length);
    }
    var last_curHL;

    return (
      <div onKeyDown={this.handleKeyDown} ref={(ref) => this.articleRef = ref }
           onMouseUp={this.handleClick}
           className="article-click-box">
        {highlights.map( (curHL, i) => {
          start = curHL.end;
          var topics = []
          for (var j = 0; j < curHL.topics.length; j++) {
            var id = curHL.topics[j];
            for (var k = 0; k < this.props.topics.length; k++) {
              var temp_topic = this.props.topics[k]
              var topic_id = temp_topic.id
              if (id == topic_id) {
                topics.push(temp_topic.name)
              }
            }
          }
          const source = curHL.handleRight.source;
          // Highlight merge algorithm is supposed to merge overlapping highlights of same
          // topic, so if this key is not unique, the merge algo needs work.
          const reactKey = (String(curHL.start) + '.' + String(curHL.end) +'.' +
                            String(source.topic) + '.' + String(source.caseNum));
          if (curHL.handleRight.type == 'start') {
            var handleEnd = (
              <HandleEnd
                highlight={curHL.handleRight.source}
                color={this.mergeColors([curHL.handleRight.source.topic], highlights[i+1].selected)}
                caseNum={curHL.handleRight.source.caseNum}
                caseMax={this.props.caseMax}
                onClick={(e) => {
                  this.handleCase(curHL.handleRight.source, e, -1);
                }}
              />
            );

            return (
              <span key={reactKey}
                style={{backgroundColor: this.mergeColors(curHL.topics, curHL.selected), position: "relative"}}
                title={topics}
                onClick={(e) => {
                  this.handleSelect(curHL.source, e)
                }}
              >
                <span className="articleText" style={{position: 'relative'}}>
                  {getHintedText(text, curHL.start, curHL.end, this.props.hints_offsets)}
                  {handleEnd}
                </span>
              </span>
            );
          } else if (curHL.handleRight.type == 'end') {

            var handleStart = (
              <HandleStart
                highlight={curHL.handleRight.source}
                color={this.mergeColors([curHL.handleRight.source.topic], curHL.selected)}
                caseNum={curHL.handleRight.source.caseNum}
                caseMax={this.props.caseMax}
                onClick={(e) => {
                  this.handleCase(curHL.handleRight.source, e, 1);
                }}
                />
            );

            return (
              <span key={reactKey}
                style={{backgroundColor: this.mergeColors(curHL.topics, curHL.selected), position: "relative"}}
                title={topics}
                onClick={(e) => {
                  this.handleSelect(curHL.source, e)
                }}
              >
                <span className="articleText" style={{position: 'relative'}}>
                  {getHintedText(text, curHL.start, curHL.end, this.props.hints_offsets)}
                  {handleStart}
                </span>
              </span>
            );
          } else {
            return (
              <span key={reactKey}
                className="articleText"
                onClick={this.handleSelect.bind(this, curHL.source)}
                style={{backgroundColor: this.mergeColors(curHL.topics, curHL.selected), position: "relative"}}
                title={topics}>
                {getHintedText(text, curHL.start, curHL.end, this.props.hints_offsets)}
              </span>
            );
          }
        })}

        <span key={String(text.length - tail.length) + '.' +String(text.length)} className="articleText">
          {getHintedText(text, text.length - tail.length, text.length, this.props.hints_offsets)}
        </span>
      </div>
    );
    // Need to render tail using article relative start,end
    // in order to place hints correctly in tail.
  }
});

export default HighlightTool;
