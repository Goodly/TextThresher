import { combineReducers } from 'redux';
import { article } from './article';
import { topicPicker } from './topicPicker';
import { quiz } from './quiz';
import { project } from './project.js';
import { highlight } from './highlight';
import { djangoHighlightTasks } from './djangoHighlights';
import { djangoQuizTasks } from './djangoQuiz';

const rootReducer = combineReducers({
  article,
  topicPicker,
  project,
  highlight,
  djangoHighlightTasks,
  quiz,
  djangoQuizTasks
});

export default rootReducer;
