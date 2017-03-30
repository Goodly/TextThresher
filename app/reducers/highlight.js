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
    case 'CLEAR_HIGHLIGHTS':
      return Object.assign({}, state, {highlights:[]});
    case 'DESELECT_HIGHLIGHT':
      return Object.assign({}, state, {selectedHighlight:[]});
    case 'ADD_HIGHLIGHT':
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
          if (a.end > a.end) {
            return 1;
          } else {
            return -1;
          }
        } else if (a.start < b.start) {
          return -1;
        } else {
          return 1;
        }
      });
      var new_highlights = mergeHighlights(newHighlights, action.text);
      return Object.assign({}, state,
                           { highlights: new_highlights});
    case 'SELECT_HIGHLIGHT':
      var indices = [];
      for(var x = 0; x < action.highlight.length; x++){
        indices.push([action.highlight[x].start, action.highlight[x].end]);
      }
      return Object.assign({}, state, { selectedHighlight: indices});
    case 'DELETE_HIGHLIGHT':
      var kept = state.highlights;
      for(var x = 0; x < action.highlights.length; x+=1) {
        for(var y = 0; y < kept.length; y+=1) {
          var same_start = action.highlights[x][0] == kept[y].start;
          var same_end = action.highlights[x][1] == kept[y].end;
          if (same_start && same_end) {
            kept.splice(y, 1);
            y -= 1;
          }
        }
      }
      var new_state = kept;
      return Object.assign({}, state, { highlights: new_state, selectedHighlight: []});
    case 'CHANGE_CASE_HIGHLIGHT':
      var new_highlights = [];
      var caseMax = 0;
      for (var i = 0; i < state.highlights.length; i++) {
        var highlight = state.highlights[i];
        if (highlight.text.localeCompare(action.highlight.text) == 0 && highlight.topic == action.highlight.topic) {
          highlight.caseNum = action.caseNum
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
