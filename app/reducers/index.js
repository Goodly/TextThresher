import { combineReducers } from 'redux';
import articleReducers from './articleReducers';
import quizReducers from './quizReducers';

const rootReducer = combineReducers({
  articleReducers,
  quizReducers
});

export default rootReducer;
