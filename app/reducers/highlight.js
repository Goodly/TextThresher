import merge from '../components/HighlightTool/merge';
import overlap from '../components/HighlightTool/overlap';
import mergeHighlights from '../components/HighlightTool/mergeHighlights';



const initialState = Object.assign({
  highlights: [],
  selectedHighlight: [],
  caseMax: 1,
});

export function highlight(state = initialState, action) {
  switch (action.type) {
    case 'DESELECT_HIGHLIGHT':
    console.log("DESELECT");
    return Object.assign({}, state, {selectedHighlight:[]});

    case 'ADD_HIGHLIGHT':
      console.log("ADD_HIGHLIGHT")
      console.log(state)
      console.log(action)
      var new_state = [];
      var newHighlights = state.highlights.concat(
        { start: action.selection.start,
          end: action.selection.end,
          text: action.selection.selectedText,
          topic: action.selection.currentTopic,
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
      var new_highlights = mergeHighlights(newHighlights, action.text);
      console.log(new_highlights)
      return Object.assign({}, state,
                           { highlights: new_highlights});
    case 'SELECT_HIGHLIGHT':
      console.log('SELECT_HIGHLIGHT')
      console.log(state)
      console.log(action)
      //var highlighted


      var select = action.highlight;
      /*var old_order = action.highlight.order;
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
      }*/

      /*var index = 0;
      var indices = [];
      while (i < select.length) {
        var selected = select[i];
        var h = 0;
        while (h < state.highlights.length) {
          var highlight = state.highlights[h];
          if (overlap(selected, highlight)) {
            var start = highlight.start;
            var end = highlight.end;
            indices.push([start, end])
            h += 1;
          }
        }
        i += 1;
      }*/


      var indices = [];
      var i = 0;
      while (i < select.length) {
        var start = select[i].start;
        var end = select[i].end;
        indices.push([start, end])
        i += 1;
      }
      //return Object.assign({}, state, { selectedHighlight: indices, highlights: new_highlights});
      console.log("SELECT_HIGHLIGHT OUTPUT")
      console.log(indices)
      return Object.assign({}, state, { selectedHighlight: indices});

    case 'DELETE_HIGHLIGHT':
      console.log('DELETE_HIGHLIGHT')
      console.log(state)
      console.log(action)
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
      console.log("CHANGE_CASE_HIGHLIGHT");
      console.log(state)
      console.log(action)
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
