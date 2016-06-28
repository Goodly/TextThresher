import { combineReducers } from 'redux';
import { article } from './article';
import quizReducers from './quizReducers';

const rootReducer = combineReducers({
  article,
  quizReducers
});

export default rootReducer;
