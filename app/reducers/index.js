import { combineReducers } from 'redux';
import { article } from './article';
import { topicPicker } from './topicPicker';
import { quiz } from './quiz';
import { project } from './project.js';

const rootReducer = combineReducers({
  article,
  topicPicker,
  quiz,
  project,
});

export default rootReducer;
