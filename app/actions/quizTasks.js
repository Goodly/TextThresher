const { fetch, Request, Response, Headers } = require('fetch-ponyfill')();

import { storeProject } from 'actions/project';
import { storeQuizTask, storeSaveAndNext } from 'actions/quiz';

import { normalize, Schema, arrayOf } from 'normalizr';

let taskSchema = new Schema('tasks');
let taskList = arrayOf(taskSchema);

function storeTasks(dispatch, pagedTasks) {
  // Actually, the paged quiz endpoint isn't ready yet, this is already a task list
  // Django backend doesn't provide task ids, so copy article id as the task id
  pagedTasks = pagedTasks.map(
    (task, index) => ({...task, id: index*10+5})
  );
  // Normalize data structure and dispatch
  const taskDatabase = normalize(pagedTasks, taskList);
  // Replace or push task IDs to queue
  dispatch({type: 'FETCH_QUIZ_TASKS_SUCCESS', taskDatabase});
  // Make a copy of the unique task Ids collected by normalize
  let taskQueue = taskDatabase.result.slice();
  dispatch({type: 'UPDATE_QUIZ_TASK_QUEUE', taskQueue});
}

function presentTask(dispatch, getState) {
  const quizTasks = getState().quizTasks;
  const taskDB = quizTasks.taskDatabase.entities.tasks;
  let taskQueue = quizTasks.taskQueue.slice();
  if (taskQueue.length > 0) {
    const taskId = taskQueue.shift();
    const task = taskDB[taskId];

    dispatch({type: 'UPDATE_QUIZ_TASK_QUEUE', taskQueue});
    dispatch(storeProject(task.project));
    dispatch(storeQuizTask(task));

    function onSaveAndNext(answers) {
      // TODO: dispatch save quiz answers which will return a promise, so
      // promise.then( call this ) to load next task
      // or better, deep copy answers and don't wait to show next task
      presentTask(dispatch, getState);
    }
    // Tricky part: We have loaded the task, now we also provide the
    // callback that the UI button can use to save the data and trigger
    // loading the next task.
    dispatch(storeSaveAndNext(onSaveAndNext));
  } else {
    // TODO: update store with done flag and show nicely in UI
    console.log('No more tasks.');
    throw new Error('No more tasks.');
  }
}

export function fetchQuizTasks() {
  return (dispatch, getState) => {
    dispatch({type: 'FETCH_QUIZ_TASKS'});
    let host = "http://localhost:5000";
    return fetch(host + `/api/quiz_tasks/?format=json`)
      .then(response => response.json())
      .then(
        pagedTasks => {
          storeTasks(dispatch, pagedTasks);
          presentTask(dispatch, getState);
        },
        error => dispatch({type: 'FETCH_QUIZ_TASKS_FAIL', error})
      )
  };
}
