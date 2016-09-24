import { combineReducers } from 'redux';
import { article } from './article';
import { topics } from './topics';

import quizReducers from './quizReducers';

const rootReducer = combineReducers({
  article,
  topics,
  quizReducers
});

export default rootReducer;
