import { combineReducers } from 'redux';
import { article } from './article';
import { topicPicker } from './topicPicker';
import { quiz } from './quiz';
import { project } from './project.js';
import { highlight } from './highlight';
import { highlightTasks } from './highlightTasks';

const rootReducer = combineReducers({
  article,
  topicPicker,
  quiz,
  project,
  highlight,
  highlightTasks
});

export default rootReducer;
