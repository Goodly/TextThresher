import { NEW_QUESTIONS } from 'actions/article'; // TODO: create new action here
import tmpQuestions from '../assets/tmpQuestions.json';

const initialState = {
  questions: tmpQuestions.initialQuestion
}

export default function quizReducer(state = initialState, action) {
  switch (action.type) {
    case NEW_QUESTIONS:
      return Object.assign({}, state, { questions: action.questions });
    default:
      return state;
  }
}
