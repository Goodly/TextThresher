import { combineReducers } from 'redux';
import { article } from './article';
import quizReducers from './quizReducers';
import { highlight } from './highlight';
import {topicpicker} from './topicpicker';

const rootReducer = combineReducers({
  article,
  quizReducers,
  highlight,
  topicpicker
});

export default rootReducer;
