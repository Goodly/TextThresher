import { storeProject } from 'actions/project';
import { storeQuestion, storeSaveAndNext } from 'actions/quiz';

import { normalize, Schema, arrayOf } from 'normalizr';

let taskSchema = new Schema('tasks');
let taskList = arrayOf(taskSchema);

function storeTasks(dispatch, pagedTasks) {
  // Actually, the paged quiz endpoint isn't ready yet, this is already a task list
  // Until back-end returns task ids, provide a temporary unique id
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

function postQuizAnswers(answers) {
  return (dispatch) => {
    dispatch({ type: 'POST_ANSWERS'});

    return fetch(`http://localhost:5000/api/postAnswers`, {
        method: 'POST',
        body: answers
      })
      .then(response => response.json())
      .then(
        (response) => dispatch({ type: 'POST_ANSWERS_SUCCESS'}, response),
        (error) => dispatch({ type: 'POST_ANSWERS_FAIL', error})
      );
  };
}

function presentTask(dispatch, getState) {
  const quizTasks = getState().quizTasks;
  const taskDB = quizTasks.taskDatabase.entities.tasks;
  let taskQueue = quizTasks.taskQueue.slice();
  if (taskQueue.length > 0) {
    const taskId = taskQueue.shift();
    const task = taskDB[taskId];
    dispatch(storeProject(task.project));
    // Hard-code a particular question to show to get this working
    dispatch(storeQuestion(task.questions[1]));
    // Dispatch an action to clear any prior answers
    // dispatch(XXXX);
    dispatch({type: 'UPDATE_QUIZ_TASK_QUEUE', taskQueue});
    dispatch({type: 'CURRENT_QUIZ_TASK', taskId});

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

export function fetchQuizTasks(pageParam) {
  return (dispatch, getState) => {
    dispatch({type: 'FETCH_QUIZ_TASKS'});
    let host = "http://localhost:5000";
    let pageParam = pageParam ? pageParam : '';
    return fetch(host + `/api/quiz_tasks/?format=json${pageParam}`)
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
