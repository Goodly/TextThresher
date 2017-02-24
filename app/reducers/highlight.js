import merge from '../components/HighlightTool/merge';
import overlap from '../components/HighlightTool/overlap';


const initialState = Object.assign({
  highlights: [],
  selectedHighlight: [],
  caseMax: 1,
});

/*function overlap(h1, h2) {
  if (h1.start <= h2.start && h1.end >= h2.end) {
    return true;
  } else if (h1.start <= h2.start && h1.end <= h2.end && h1.end > h2.start) {
    return true;
  } else if (h2.start <= h1.start && h2.end <= h1.end && h2.end > h3.start) {
    return true;
  } else {
    return false;
  }
}

function merge(h1, h2, text) {
  if (h1.topic != h2.topic) {
    throw "merge method error: topic not equal";
  } else if (h1.start <= h2.start && h1.end >= h2.end) {
    var h = {
      "caseNum": h1.caseNum,
      "end": h1.end,
      "start": h1.start,
      "text": h1.text,
      "topic": h1.topic
    }
    return h;
  } else if (h2.start <= h1.start && h2.end >= h1.end) {
    var h = {
      "caseNum": h1.caseNum,
      "end": h1.end,
      "start": h1.start,
      "text": h1.text,
      "topic": h1.topic
    }
    return h;
  } else if (h1.start <= h2.start && h1.end <= h2.end && h1.end >= h2.start) {
    var h = {
      "caseNum": h1.caseNum,
      "end": h2.end,
      "start": h1.start,
      "text": text.slice(h1.start, h2.end),
      "topic": h1.topic
    }
    return h;
  } else if (h2.start <= h1.start && h2.end <= h1.end && h2.end >= h2.start) {
    var h = {
      "caseNum": h1.caseNum,
      "end": h2.end,
      "start": h1.start,
      "text": text.slice(h2.start, h1.end),
      "topic": h1.topic
    }
    return h;
  } else {
    return h1;
  }
}*/

function mergeHighlights(highlights, text) {
  var merged = [];
  var current = highlights[0];
  var i = 1;
  var added = false;
  while (i < highlights.length) {
    var compare = highlights[i];
    //var topic = compare.topic === current.topic;
    if (overlap(current, compare)) {
      current = merge(current, compare, text);
      i += 1;
    } else {
      merged.push(current);
      var one = i+1 < highlights.length;
      var two = i+2 < highlights.length;
      if (one && two) {
        i += 1;
        current = highlights[i];
        i += 1;
        continue;
      } else if (one) {
        i += 1;
        current = highlights[i];
        i += 1;
      } else {
        i += 1;
      }
    }
  }
  merged.push(current);
  return merged;
}


/*function mergeHighlights(list, text) {
  var newlist = [];
  var n = list.length;
  for (var i = 0; i < n;) {
    var newrange = Object.assign({}, list[i]);
    for (var j = i + 1; j < n; j++) {
      if ((list[i].end >= list[j].start) && (list[i].topic === list[j].topic)) {
        newrange.text += list[j].text.substring(
          Math.min(newrange.end, list[j].end) - list[j].start, list[j].end
        );
        newrange.end = Math.max(list[j].end, newrange.end);
        continue;
      } else {
        break;
      }
    }
    i = j;
    newlist.push(newrange);
  }
  return newlist;
}*/

export function highlight(state = initialState, action) {
  switch (action.type) {
    case 'DESELECT_HIGHLIGHT':
    return Object.assign({}, state, {selectedHighlight:[]});

    case 'ADD_HIGHLIGHT':
    console.log(state)
    console.log(action)
    console.log("ADD High")
      var new_state = [];
      for (var i = 0; i < state.highlights.length; i++) {
        state.highlights[i].order += 1;
      }
      var newHighlights = state.highlights.concat(
        { start: action.selection.start,
          end: action.selection.end,
          text: action.selection.selectedText,
          topic: action.selection.currentTopic,
          order: action.selection.order,
          caseNum: 1
        }
      ).sort((a,b) => {
        if (a.start === b.start) {
          return 0;
        } else if (a.start < b.start) {
          return -1;
        } else {
          return 1;
        }
      });
      return Object.assign({}, state,
                           { highlights: mergeHighlights(newHighlights, action.text) });
    case 'SELECT_HIGHLIGHT':
    //console.log('SELECT_HIGHLIGHT');
      /*Add start-end indices of clicked span to selectedHighlights
      The indices are used in render to 'select' and darken the span*/

      //selected highlight order set to 1, order below selected highlight incremented by one, otherwise remain the same
      var select = action.highlight;
      var old_order = action.highlight.order;
      var new_highlights = [];
      for (var i = 0; i < state.highlights.length; i++) {
        var highlight = state.highlights[i];
        if (old_order > highlight.order) {
          highlight.order += 1;
          new_highlights.push(highlight);
        } else if (old_order == highlight.order) {
          highlight.order = 1;
          new_highlights.push(highlight);
        } else {
          new_highlights.push(highlight);
        }
      }

      var indices = [];
      var i = 0;
      while (i < select.length) {
        var start = select[i].start;
        var end = select[i].end;
        indices.push([start, end])
        i += 1;
      }
      return Object.assign({}, state, { selectedHighlight: indices, highlights: new_highlights});

    case 'DELETE_HIGHLIGHT':
    //console.log('DELETE_HIGHLIGHT');
      /*Remove selected highlights in state.highlights using the
      indices from selectedHighlights. Also reset selectedHighlights*/
      var new_state = [];
      var indices = [];
      var stateindex = 0;
      while (stateindex < state.highlights.length) {
        var actionindex = 0;
        var pushbool = true;
        while (actionindex < action.highlights.length) {
          var a_h = action.highlights[actionindex];
          // Highlight to be deleted
          var s_h = state.highlights[stateindex];
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
      return Object.assign({}, state, { highlights: new_state, selectedHighlight: []});

    case 'CHANGE_CASE_HIGHLIGHT':
      console.log("CHANGE_CASE");
      var new_highlights = [];
      var caseMax = 0;
      for (var i = 0; i < state.highlights.length; i++) {
        var highlight = state.highlight[i];
        if (highlight.text.localeCompare(action.highlight.text) && highlight.top == action.highlight.top) { //equally may not work
          highlight.caseNum = action.caseNum;
        }
        if (hightlight.caseNum > caseMax) {
          caseMax = highlight.caseNum;
        }
        new_highlights.push(highlight);
      }
      return Object.assign({}, state, {highlights: new_highlights, caseMax: caseMax});

    default:
      return state;
  }
}

module.exports = {
  overlap,
  merge,
  mergeHighlights,
  highlight
}
