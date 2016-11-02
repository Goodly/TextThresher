import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as highlightActionCreators from 'actions/highlight'
import './styles.scss';

const assembledActionCreators = Object.assign({}, highlightActionCreators);

const mapStateToProps = state => {
  return {
    highlights: state.highlight.highlights,
    selectedHighlight: state.highlight.selectedHighlight
  };
}

const HandleEnd = React.createClass({
  displayName: 'HandleEnd',

  PropTypes: {
    highlight: React.PropTypes.object,
    color: React.PropTypes.string,
    caseNum: React.PropTypes.number,
    caseMax: React.PropTypes.number
  },

  render() {
    var arrowup = {
      width: "0",
      height: "0",
      position: "absolute",
      borderLeft: "10px solid transparent",
      borderRight: "10px solid transparent",
      borderBottom: "15px solid " + this.props.color,
      bottom: "-12px",
      right: "-10px",
      cursor: "pointer"
    }
    var arrowdown = {
      width: "0",
      height: "0",
      position: "absolute",
      borderLeft: "10px solid transparent",
      borderRight: "10px solid transparent",
      borderTop: "15px solid " + this.props.color,
      top: "-12px",
      right: "-10px",
      color: "white",
      fontSize: "12",
      cursor: "pointer"
    }

    var iconup = {
      position: "absolute",
      bottom: "-22px",
      right: "-2px",
      color: "white",
      fontSize: "13px",
    }

    var icondown = {
      position: "absolute",
      top: "-24px",
      right: "-2.5px",
      color: "white",
      fontSize: "13px",
    }


    var new_case = this.props.caseNum - 1;
    if (new_case == 0) {
      new_case = 1;
    }
    //npm react-draggable
    //$( "#draggable" ).draggable({ axis: "x" });
    //onclick={highlight.changeCaseHighlight(this.props.highlight, new_case)}
    //{this.props.caseNum}
    //{"-"}
    return (
      <span>
        <div style={arrowup}>
          <div style={iconup}>
            {"-"}
          </div>
        </div>
        <div style={arrowdown}>
          <div style={icondown}>
            {this.props.caseNum}
          </div>
        </div>
      </span>
    )
  }
});

const HandleStart = React.createClass({
  displayName: 'HandleStart',

  PropTypes: {
    highlight: React.PropTypes.object,
    color: React.PropTypes.string,
    caseNum: React.PropTypes.number,
    caseMax: React.PropTypes.number
  },

  render() {
    var arrowup = {
      position: "absolute",
      width: "0",
      height: "0",
      borderLeft: "10px solid transparent",
      borderRight: "10px solid transparent",
      borderBottom: "15px solid " + this.props.color,
      bottom: "-12px",
      left: "-10px",
      color: "white",
      fontSize: "8",
      cursor: "pointer"
    }
    var arrowdown = {
      position: "absolute",
      width: "0",
      height: "0",
      borderLeft: "10px solid transparent",
      borderRight: "10px solid transparent",
      borderTop: "15px solid " + this.props.color,
      top: "-12px",
      left: "-10px",
      color: "white",
      fontSize: "8",
      cursor: "pointer"
    }

    var iconup = {
      position: "absolute",
      bottom: "-22px",
      left: "-3px",
      color: "white",
      fontSize: "13px",
    }

    var icondown = {
      position: "absolute",
      top: "-27px",
      left: "-4.5px",
      color: "white",
      fontSize: "16px",
    }

    //style={{lineHeight: "1.5", width: "1px", whiteSpace:"nowrap"}}
    return (
      <span >
        <div style={arrowup}>
          <div style={iconup}>
            {this.props.caseNum}
          </div>
        </div>
        <div style={arrowdown} >
          <div style={icondown}>
            {"+"}
          </div>
        </div>
      </span>
    )
  }
});

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

  processHighlights: function(highlights) {

    console.log('processHighlights');

    var parsedHighlights = [];
    var final = [];

    // (1)

    var temp_index = 0;
    while (temp_index < highlights.length) {
      var i = highlights[temp_index];
      var start = {type: 'start', index: i.start, topic: i.topic, source: i, selected: false};
      var end = {type: 'end', index: i.end, topic: i.topic, source: i, selected: false};
      parsedHighlights.push(start);
      parsedHighlights.push(end);
      temp_index += 1;
    }

    // (2) works
    parsedHighlights.sort((a,b) => {
      return a.index - b.index;
    });

    var activeSources = [];
    var topicNum = this.props.topics.length;
    var activeTopics = [];
    var topic_list = [];
    for (i=0; i<topicNum; i++) {
      activeTopics.push(false);
      topic_list.push(this.props.topics[i].id)
    }
    var activeSelect = false;
    var start = 0;
    var end = 0;
    temp_index = 0;

    // (3)
    var selectedHighlights = this.props.selectedHighlight;
    var topic_order = [];
    while (temp_index < parsedHighlights.length) {
      var i = parsedHighlights[temp_index];
      var processed = {start: null, end: null, topics: [], source: activeSources.slice(0), selected: false};
      processed.start = start;
      processed.end = i.index;

      // (4)
      if (selectedHighlights.length) {
        var select_index = 0;
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

      // (5) Activate/Deactivate Topics
      var active_state = i.type === 'start';
      for(index=0;index<activeTopics.length;index+=1) {
        if (i.topic == topic_list[index]) {
          activeTopics[index] = active_state;
        }
      }
      // (6) Activate/Deactivate Sources
      if (active_state){
        var active = {start: i.source.start, end: i.source.end, text: i.source.text, top: i.source.topic};
        activeSources = activeSources.concat([active]);
      } else {
        var active = {start: i.source.start, end: i.source.end, text: i.source.text, top: i.source.topic};
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

  From list of topics, gathers

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

  correctionStart: function(start) {
    var correction = 0;
    var ch = this.props.text[start];
    var inwards = ((ch == ' ') || (ch == '\t') || (ch == '\n'));
    var edit = 1;
    if (inwards) {
      edit = 0;
    }
    while (((ch == ' ') || (ch == '\t') || (ch == '\n')) == inwards) {
      if (inwards) {
        correction += 1;
      } else {
        correction -= 1;
        if (-correction > start) {
          return start + correction + 1;
        }
      }
      ch = this.props.text[start + correction];
    }
    return start + correction + edit;
  },

  correctionEnd: function(end) {
    var correction = 0;
    var ch = this.props.text[end];
    var inwards = ((ch == ' ') || (ch == '\t') || (ch == '\n'));
    var edit = 0;
    if (inwards) {
      edit = 1;
    }
    while (((ch == ' ') || (ch == '\t') || (ch == '\n')) == inwards) {
      if (inwards) {
        correction -= 1;
      } else {
        correction += 1;
        if (correction + end > this.props.text.length) {
          return end + correction - 1;
        }
      }
      ch = this.props.text[end + correction];
    }
    return end + correction + edit;
  },

  handleClick: function() {
    var currentTopicId = this.props.currentTopicId;
    var selectionObj = window.getSelection();
    if (selectionObj) {
      let selectedText = selectionObj.toString();
      var start = selectionObj.anchorOffset;
      var end = selectionObj.extentOffset;
      if (this.articleRef.childNodes.length > 1) {
        var anchorResult = getOffset(this.articleRef, selectionObj.anchorNode);
        start += anchorResult.offset;
        var extentResult = getOffset(this.articleRef, selectionObj.extentNode);
        end += extentResult.offset;
      }
//      start = this.correctionStart(start);
//      end = this.correctionEnd(end);
      console.log('TEST WORK');
      console.log(selectedText);
      var temp_text = this.props.text;
      console.log(temp_text.slice(start, end));

      if (start > end) {
        let tmp = start;
        start = end;
        end = tmp;
      }
      if (start !== end) {
        this.props.deselectHighlight();
        this.props.addHighlight(start, end, selectedText, currentTopicId, 1);
        this.props.selectHighlight([{'start':start, 'end':end, 'text':selectedText, 'topic':currentTopicId, 'order': 1 }]);
      }
    }
    //removes selection after creating highlight
    window.getSelection().removeAllRanges();
  },

  componentDidMount: function() {
    document.addEventListener('keydown',this.handleKeyDown);
    /* pass in oncontextmenu obj into contextMenu*/
    document.addEventListener('contextmenu', this.contextMenu(event));
    let HighlightContainer = document.getElementById('highlight');
  },

  handleKeyDown: function(e) {
    e.preventDefault();
    if (e.keyCode == 8 || e.keyCode == 46) {
      if (this.props.selectedHighlight) {
        if (this.props.selectedHighlight.length > 0) {
          this.props.deleteHighlight(this.props.selectedHighlight);
        }
      }
    }
  },

  contextMenu: function(e) {
    //console.log('contextMenu')
    //console.log(e)

  },

  handleSelect: function(source) {
    this.props.selectHighlight(source);
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
    return (
      <div onkeydown={this.handleKeyDown} ref={(ref) => this.articleRef = ref } onMouseUp={this.handleClick}>
        {Array(highlights.length).fill().map((_,i) => {
          var curHL = highlights[i];
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
          //console.log(curHL.source);
          var minus_case = curHL.source.caseNum - 1;
          var plus_case = curHL.source.caseNum + 1;
          if (minus_case == 0) {
            minus_case = 1;
          }
          //() => this.changeCaseHighlight(curHL.source, minus_case)
          if (topics.length > 0) {
            return (
              <span key={i}
                source = {curHL.source}
                onClick={this.handleSelect.bind(this, curHL.source)}
                style={{backgroundColor: this.mergeColors(curHL.topics, curHL.selected), position: "relative"}}
              title={topics}>
                <HandleStart
                  highlight={curHL.source}
                  color={this.mergeColors(curHL.topics, curHL.selected)}
                  caseNum={1}
                  caseMax={this.props.caseMax}
                  onClick={() => {this.props.changeCaseHighlight(highlight, plus_case)}}
                />
                <span className="articleText">
                  {text.substring(curHL.start, curHL.end)}
                </span>
                <HandleEnd
                  highlight={curHL.source}
                  color={this.mergeColors(curHL.topics, curHL.selected)}
                  caseNum={1}
                  caseMax={this.props.caseMax}
                  onClick={() => {this.props.changeCaseHighlight(highlight, minus_case)}}
                />
              </span>
            );
            /*return (
              <span key={i}
              source = {curHL.source}
              onClick={this.handleSelect.bind(this, curHL.source)}
              style={{backgroundColor: this.mergeColors(curHL.topics, curHL.selected), position: "relative"}}
              title={topics}>
                {text.substring(curHL.start, curHL.end)}
              </span>
            );*/
          } else {
            return (
              <span key={i}
                className="articleText"
                source = {curHL.source}
                onClick={this.handleSelect.bind(this, curHL.source)}
                style={{backgroundColor: this.mergeColors(curHL.topics, curHL.selected), position: "relative"}}
                title={topics}>
                {text.substring(curHL.start, curHL.end)}
              </span>
            );
          }
        })}

        <span key="tail" className="articleText">
          { tail }
        </span>
      </div>
    );
  }
});
/*

<span key={i}
source = {curHL.source}
onClick={this.handleSelect.bind(this, curHL.source)}
style={{backgroundColor: this.mergeColors(curHL.topics, curHL.selected), position: "relative"}}
title={topics}>
  <HandleStart
  highlight={curHL.source}
  color={this.mergeColors(curHL.topics, curHL.selected)}
  caseNum={1}
  caseMax={this.props.caseMax}>
  </HandleStart>
    {text.substring(curHL.start, curHL.end)}
  <HandleEnd
  highlight={curHL.source}
  color={this.mergeColors(curHL.topics, curHL.selected)}
  caseNum={1}
  caseMax={this.props.caseMax}>
  </HandleEnd>
</span>
*/

export default connect(
  mapStateToProps,
  dispatch => bindActionCreators(assembledActionCreators, dispatch)
)(HighlightTool);
