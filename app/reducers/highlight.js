const initialState = Object.assign({
  highlights: [],
  selectedHighlight: [],
  caseMax: 1,
});

function mergeHighlights(list) {
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
}

export function highlight(state = initialState, action) {
  switch (action.type) {
    case 'DESELECT_HIGHLIGHT':
    return Object.assign({}, state, {selectedHighlight:[]});

    case 'ADD_HIGHLIGHT':
      //console.log('ADD_HIGHLIGHT');
      //increment order of all old highlights by 1
      var new_state = [];
      for (var i = 0; i < state.highlights.length; i++) {
        //var highlight = state.highlights[i];
        //highlight.order += 1;
        //new_state.push(highlight);
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
                           { highlights: mergeHighlights(newHighlights) });
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

    /*case 'RESIZE_HIGHLIGHT':
      var new_highlights = [];
      for (var i = 0; i < state.highlights.length; i++) {
        var highlight = state.highlight[i];
        if (highlight.text.localeCompare(action.highlight.text) && highlight.top == action.highlight.top) { //equally may not work
          highlight.start = action.start;
          highlight.end = action.end;
        }
        new_highlights.push(highlight);
      }
      return Object.assign({}, state, {highlights: new_highlights});*/
    default:
      return state;
  }
}
