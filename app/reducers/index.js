import { combineReducers } from 'redux';
import { article } from './article';
import quizReducers from './quizReducers';
import { highlight } from './highlight';

const rootReducer = combineReducers({
  article,
  quizReducers,
  highlight
});

export default rootReducer;
