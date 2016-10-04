import { combineReducers } from 'redux';
import { article } from './article';
import { topicPicker } from './topicPicker';

import quizReducers from './quizReducers';

const rootReducer = combineReducers({
  article,
  topicPicker,
  quizReducers
});

export default rootReducer;
