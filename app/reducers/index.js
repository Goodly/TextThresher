import { combineReducers } from 'redux';
import { article } from './article';
import { topicPicker } from './topicPicker';
import { highlight } from './highlight';
import { quiz } from './quiz';
import { project } from './project.js';
import { task } from './task';
import { articleView } from './articleView';

const rootReducer = combineReducers({
  article,
  topicPicker,
  highlight,
  quiz,
  project,
  task,
  articleView,
});

export default rootReducer;
