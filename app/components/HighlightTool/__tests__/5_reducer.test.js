import {highlight} from '../../../reducers/highlight';
import {addHighlight, deleteHighlight} from '../../../actions/highlight';
import {ADD_HIGHLIGHT, DELETE_HIGHLIGHT} from '../../../actions/highlight';

const initialState = Object.assign({
  highlights: [],
  selectedHighlight: [],
  caseMax: 1,
});

test('addHighlight:', () => {
  //console.log(addHighlight(1, 10, 'hi', 1, 'hi'))
  //console.log(highlight(initialState, addHighlight(1, 10, 'hi', 1, 'hi')))
  expect(addHighlight(1, 10, 'hi', 1, 'hi')).toEqual({ type: ADD_HIGHLIGHT, selection: {start: 1, end: 10, selectedText: 'hi', currentTopic: 1}, text: 'hi' })
});

/*test('addHighlight reducer', () => {
  expect(reducer({}, addHighlight(1, 10, 'hi')))
})*/

/*test('(breakHighlights: Case 1, Test 1) no highlights returns empty', () => {
  expect(reducer({}, ).toEqual([]);
});*/
