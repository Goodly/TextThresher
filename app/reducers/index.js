import { combineReducers } from 'redux';
import { article } from './article';
import { topicPicker } from './topicPicker';
import { quiz } from './quiz';

const rootReducer = combineReducers({
  article,
  topicPicker,
  quiz
});

export default rootReducer;
