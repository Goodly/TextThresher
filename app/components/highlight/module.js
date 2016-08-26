var highlightModule = (function() {
  var text, highlights, colors, topics, currentTopic,
    selectedHighlight;

  function privateProcessHighlights(highlights) {
    console.log('processHighlights');

    var parsedHighlights = [];
    var final = [];

    // (1) works
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
      var active_state = i.type === 'start'
      for(index=0;index<activeTopics.length;index+=1) {
        if (i.topic == topic_list[index]) {
          activeTopics[index] = active_state
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
  }

  function mergeColors(topics, selected) {
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
  }

  function getOffSet(childNodes, targetNode) {
    var offset = 0;
    for (var i in childNodes) {
      var childNode = childNodes[i];
      if (childNode === targetNode) {
        break;
      } else {
        if (childNode.textContent == null) {
          break;
        } else {
          offset += childNode.textContent.length;
        }
      }
    }
    return offset;
  }

  function handleClick() {
    var currentTopic = this.props.currentTopic.slice();
    var selectionObj = window.getSelection();
    if (selectionObj) {
      let selectedText = selectionObj.toString();
      let start = selectionObj.anchorOffset;
      let end = selectionObj.extentOffset;
      if (this.articleRef.childNodes.length > 1) {
        start += this.getOffset(this.articleRef.childNodes,
                                selectionObj.anchorNode.parentNode);
        end += this.getOffset(this.articleRef.childNodes,
                                selectionObj.extentNode.parentNode);
      }
      if (start > end) {
        let tmp = start;
        start = end;
        end = tmp;
      }
      if (start !== end) {
        this.props.deselectHighlight();
        this.props.addHighlight(start, end, selectedText, currentTopic);
        this.props.selectHighlight([{'start':start, 'end':end, 'text':selectedText, 'topic':currentTopic }]);
      }
    }
    //removes selection after creating highlight
    window.getSelection().removeAllRanges();
  }

  function handleSelect(source) {
    this.props.selectHighlight(source);
  }

  function handleKeyDown(e) {
    e.preventDefault();
    if (e.keyCode == 8 || e.keyCode == 46) {
      if (this.props.selectedHighlight) {
        if (this.props.selectedHighlight.length > 0) {
          this.props.deleteHighlight(this.props.selectedHighlight);
        }
      }
    }
  },

  return {
    setText: privateSetText,
    setColors: privateSetColors,
    setTopics: privateSetTopics,
  };

})();
