var HighlighterModule = (function () {
    var privateText = {},
        privateTopics = [],
        privateCurrentTopic = [],
        privateDefColors = ['rgb(241, 96, 97)', 'rgb(253, 212, 132)', 'rgb(175, 215, 146)', 'rgb(168, 210, 191)', 'rgb(255,153,000)', 'rgb(102,000,153)', 'rgb(000,153,153)', 'rgb(255,102,255)', 'rgb(000,051,153)', 'rgb(153,000,204)', 'rgb(70,194,64)', 'rgb(94,242,188)'],
        privateColors = [],
        privateArticleIndex = [],
        privateHighlights = [],
        privateSelected = [],
        privateContainer = 'no id specified';

    /* ---------- Private Methods  --------- */

    function mergeColors(topics, selected) {

      var colors = privateColors;
      var list = [];
      var index = 0;
      for (var current=0;current <topics.length;current+=1) {
        for (var master=0;master <privateTopics.results.length;master+=1){
          if (topics[current] == privateTopics.results[master].id) {
            list.push(colors[master]);
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

    function processHighlights() {
      var highlights = privateHighlights;
      var topics = privateTopics.results;
      var selectedHighlights = privateSelected;
      var parsedHighlights = [];
      var final = [];
      var temp_index = 0;
      while (temp_index < highlights.length) {
        var i = highlights[temp_index];
        var start = {type: 'start', index: i.start, topic: i.topic, source: i, selected: false};
        var end = {type: 'end', index: i.end, topic: i.topic, source: i, selected: false};
        parsedHighlights.push(start);
        parsedHighlights.push(end);
        temp_index += 1;
      }

      // (2)
      parsedHighlights.sort((a,b) => {
        return a.index - b.index;
      });

      var activeSources = [];
      var topicNum = topics.length;
      var activeTopics = [];
      var topic_list = [];
      for (i=0; i<topicNum; i++) {
        activeTopics.push(false);
        topic_list.push(topics[i].id)
      }
      var activeSelect = false;
      var start = 0;
      var end = 0;
      temp_index = 0;

      // (3)
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

    function mergeHighlights(list) {
      console.log('merge highlights')
      var newlist = [];
      var n = list.length;
      for (var i = 0; i < n; i++) {
        var newrange = Object.assign({}, list[i]);
        var start = list[i].start;
        var end = list[i].end;
        var j = i + 1;
        var check = true;
        while (j < n) {
          if (list[i].topic === list[j].topic) {
            if (list[j].start < end) {
              end = Math.max(end, list[j].end)
              list.splice(j,1);
              newrange.end = end;
              newrange.text = privateText.substring(start, end)
              n-=1;
            } else {
              break;
            }
          } else {
            j++;
          }
        }
        newlist.push(newrange);
      }
      return newlist;
    }

    function getOffset(childNodes, targetNode) {
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

    /* ----------- Private Listener Methods ----------- */

    function handleKeydown(e) {
      console.log('handleKeyDown');
      e.preventDefault();
      var code = e.keyCode;
      if (code == 8 || code == 46) {
        if (privateSelected.length > 0) {
          deleteHighlight(privateSelected);
        }
      } else if (47 < code < 58) { //Temporary section for updating currenttopic
        code -= 48;
        privateCurrentTopic = code;
      }
    }

    function handleMouseup(e) {
      console.log('handleclick');

      var container = document.getElementById('highlighter');
      var currentTopic = privateTopics.results[privateCurrentTopic].id;
      var selectionObj = window.getSelection();
      if (selectionObj) {
        let selectedText = selectionObj.toString();
        let start = selectionObj.anchorOffset;
        let end = selectionObj.extentOffset;
        if (container.childNodes.length > 1) {
          start += getOffset(container.childNodes,
                                  selectionObj.anchorNode.parentNode);
          end += getOffset(container.childNodes,
                                  selectionObj.extentNode.parentNode);
        }
        if (start > end) {
          let tmp = start;
          start = end;
          end = tmp;
        }
        if (start !== end) {
          if (window.getSelection) {
            window.getSelection().removeAllRanges;
          }
          var selection = {'start': start, 'end': end, 'text': selectedText, 'topic': currentTopic};
          deselectHighlight();
          addHighlight(selection);
          selectHighlight([selection]);
        }
      }
      //removes selection after creating highlight
    }

    /* ---------- Private Update State Methods ---------- */

    function deselectHighlight() {
      console.log('deselect');
      privateSelected = [];
      privateRender();
    }

    function addHighlight(selection) {
      console.log('add');

      var newHighlights = privateHighlights.concat(
        { start: selection.start,
          end: selection.end,
          text: selection.text,
          topic: selection.topic }
      ).sort((a,b) => {
        if (a.start === b.start) {
          return 0;
        } else if (a.start < b.start) {
          return -1;
        } else {
          return 1;
        }
      });
      var merged = mergeHighlights(newHighlights);
      privateHighlights = merged;
      privateRender();
    }

    function selectHighlight(highlights) {
      console.log('select');
      var indices = [];
      var i = 0;
      while (i < highlights.length) {
        var start = highlights[i].start;
        var end = highlights[i].end;
        indices.push([start, end])
        i += 1;
      }
      privateSelected = indices;
      privateRender();
    }

    function deleteHighlight(highlights) {
      console.log('delete');

      var new_state = [];
      var indices = [];
      var stateindex = 0;
      while (stateindex < privateHighlights.length) {
        var actionindex = 0;
        var pushbool = true;
        while (actionindex < highlights.length) {
          var a_h = highlights[actionindex];
          // Highlight to be deleted
          var s_h = privateHighlights[stateindex];
          //Current highlights
          if (a_h[0] == s_h.start && a_h[1] == s_h.end){
            pushbool = false;
          }
          actionindex += 1;
        }
        if (pushbool) {
          new_state.push(s_h);
        }
        stateindex += 1;
      }
      privateHighlights = new_state;
      privateSelected = [];
      privateRender();
    }

    function clearHighlights() {
      console.log('clear');
      privateHighlights = [];
      privateRender();
    }



    /* ---------- RENDER ----------- */

    function privateRender() {
      console.log('render')
      var highlights = privateHighlights;
      var text = privateText;
      var container = privateContainer;
      highlights = processHighlights() || [];
      var start = 0;
      var tail = document.createElement('span');
      var l = highlights.length;
      if (l === 0) {
        tail.innerHTML = text;
      } else if (highlights[l - 1].end !== text.length) {
        tail.innerHTML = text.substring(highlights[l - 1].end, text.length);
      }

      var main_container = document.getElementById(privateContainer);

      if (main_container.childNodes.length < 2) {
        var temp_container = document.createElement('div');
        temp_container.id = 'highlighter';
        temp_container.innerHTML = 'temp!';
        main_container.appendChild(temp_container);
      }
      var working_container = document.createElement('div');

      var test = Array(highlights.length).fill().map(function(_,i) {
        var curHL = highlights[i];
        start = curHL.end;
        var topics = [];
        for (var j = 0; j < curHL.topics.length; j++) {
          var id = curHL[j];
          for (var k = 0; k < privateTopics.length; k++) {
            var temp_topic = privateTopics[k];
            var topic_id = temp_topic.id;
            if (id == topic_id) {
              topics.push(temp_topic.name);
            }
          }
        }
        var color_style = mergeColors(curHL.topics, curHL.selected);
        var highlight_span = document.createElement('span');
        highlight_span.addEventListener('click', function() {selectHighlight(curHL.source);})
        highlight_span.style.backgroundColor = color_style + '';
        //highlight_span.title = topics + '';
        highlight_span.id = i + '';
        highlight_span.innerHTML += text.substring(curHL.start, curHL.end);
        return highlight_span
      })

      for (var i = 0; i < test.length; i++) {
        working_container.appendChild(test[i])
      }
      working_container.appendChild(tail);
      document.getElementById('highlighter').remove();
      working_container.id = 'highlighter';
      main_container.appendChild(working_container);
      window.addEventListener('keydown', function(e) {handleKeydown(e);}, false);
      working_container.addEventListener('mouseup', function(e) {handleMouseup(e);}, false);
    }

    /* ---------- Public Methods ---------- */

    /* Set Methods */

    function publicInit(topics, text, currentTopic, colors, container) {
      privateTopics = topics;
      privateText = text;
      privateCurrentTopic = currentTopic;
      privateColors = colors;
      privateContainer = container;
      privateRender();
    }

    function publicSetTopics( topics ) {
        privateTopics = topics;
    }

    function publicSetText( text ) {
        privateArticle = text;
    }

    function publicSetTopic( topic ) {
        privateCurrentTopic = topic;
    }

    function publicSetColors( colors ) {
        privateColors = colors;
    }


    /* Get Methods*/

    function publicGetHighlights() {
      return privateHighlights;
    }

    return {
        setTopics: publicSetTopics,
        setText: publicSetText,
        setColors: publicSetColors,
        setCurrentTopic: publicSetTopic,
        getHighlights: publicGetHighlights,
        init: publicInit
    };
})();
