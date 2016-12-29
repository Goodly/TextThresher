import { combineReducers } from 'redux';
import { article } from './article';
import { topicPicker } from './topicPicker';
import { quiz } from './quiz';
import { project } from './project.js';
import { highlight } from './highlight';
import { highlightTasks } from './highlightTasks';
import { quizTasks } from './quizTasks';

const rootReducer = combineReducers({
  article,
  topicPicker,
  project,
  highlight,
  highlightTasks,
  quiz,
  quizTasks
});

export default rootReducer;
