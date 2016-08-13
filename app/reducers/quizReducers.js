import { NEW_QUESTION, SWITCH_ACTIVE_QUESTION } from 'actions/article'; // TODO: create new action here
import tmpQuestions from '../assets/tmpQuestions.json';
// import React Update Addon to add new elements to the array
// to avoid the deep merging issue

const initialState = {
  questions: [tmpQuestions.initialQuestion], 
  activeQuestion: 0
}

export default function quizReducer(state = initialState, action) {
    switch (action.type) {
        case NEW_QUESTION:
            return update(state, {{$add}}) //look at react update to complete
        case SWITCH_ACTIVE_QUESTION:
            return Object.assign({}, state, { activeQuestion: 0})
        default:
            return state;
    }
}
