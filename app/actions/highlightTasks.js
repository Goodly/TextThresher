const { fetch, Request, Response, Headers } = require('fetch-ponyfill')();

import { storeProject } from 'actions/project';
import { storeArticle, storeSaveAndNext } from 'actions/article';
import { storeTopics } from 'actions/topicPicker';

import { normalize, Schema, arrayOf } from 'normalizr';

let taskSchema = new Schema('tasks');
let taskList = { results: arrayOf(taskSchema) };

function storeTasks(dispatch, pagedTasks) {
  // Until back-end returns task ids, copy article id as the task id
  pagedTasks.results = pagedTasks.results.map(
    (task) => ({...task, id: task.article.id})
  );
  // Normalize data structure and dispatch
  const taskDatabase = normalize(pagedTasks, taskList);
  // Replace or push task IDs to queue
  dispatch({type: 'FETCH_HIGHLIGHT_TASKS_SUCCESS',
            pagedTasks,
            taskDatabase
  });
  // Make a copy of the unique task Ids collected by normalize
  let taskQueue = taskDatabase.result.results.slice();
  dispatch({type: 'UPDATE_HIGHLIGHT_TASK_QUEUE', taskQueue});
}

function postArticleHighlights(highlightsString, articleId) {
  return (dispatch) => {
    dispatch({ type: 'POST_HIGHLIGHTS'});

    return fetch(`http://localhost:5000/api/postHighlights/${articleId}`, {
        method: 'POST',
        body: highlightsString
      })
      .then(response => response.json())
      .then(
        (response) => dispatch({ type: 'POST_HIGHLIGHTS_SUCCESS'}, response),
        (error) => dispatch({ type: 'POST_HIGHLIGHTS_FAIL', error})
      );
  };
}

function presentTask(dispatch, getState) {
  const taskReducer = getState().highlightTasks;
  const taskDB = taskReducer.taskDatabase.entities.tasks;
  let taskQueue = taskReducer.taskQueue.slice();
  if (taskQueue.length > 0) {
    const taskId = taskQueue.shift();
    const task = taskDB[taskId];
    dispatch(storeProject(task.project));
    dispatch(storeArticle(task.article));
    dispatch(storeTopics(task.topics));
    // Dispatch an action to clear any existing highlights
    // dispatch(XXXX);
    dispatch({type: 'UPDATE_HIGHLIGHT_TASK_QUEUE', taskQueue});
    dispatch({type: 'CURRENT_HIGHLIGHT_TASK', taskId});

    function onSaveAndNext(highlights) {
      // dispatch save highight action which will return a promise, so
      // promise.then( call this ) to load next task
      // or better, deep copy highlights and don't wait to show next task
      presentTask(dispatch, getState);
    }
    // Tricky part: We have loaded the task, now we also provide the
    // callback that the U button can use to save the data and trigger
    // loading the next task.
    dispatch(storeSaveAndNext(onSaveAndNext));
  } else {
    // TODO: update store with done flag and show nicely in UI
    console.log('No more tasks.');
    throw new Error('No more tasks.');
  }
}

export function runNextTask() {
  return (dispatch, getState) => presentTask(dispatch, getState);
}

export function fetchHighlightTasks(pageParam) {
  return (dispatch, getState) => {
    dispatch({type: 'FETCH_HIGHLIGHT_TASKS'});
    let host = "http://localhost:5000";
    let pageParam = pageParam ? pageParam : '';
    return fetch(host + `/api/highlighter_tasks2/?format=json${pageParam}`)
      .then(response => response.json())
      .then(pagedTasks => {
              storeTasks(dispatch, pagedTasks);
              presentTask(dispatch, getState);
            },
            error => dispatch({type: 'FETCH_HIGHLIGHT_TASKS_FAIL', error})
      )
  };
}
