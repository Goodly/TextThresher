const { fetch, Request, Response, Headers } = require('fetch-ponyfill')();

import { storeProject } from 'actions/project';
import { storeQuizTask, storeSaveAndNext } from 'actions/quiz';

import { normalize, Schema, arrayOf } from 'normalizr';

let taskSchema = new Schema('tasks');
let taskList = arrayOf(taskSchema);

// helper function to initialize queue
function addNonContingentQuestions(questions) {

  var contained = new Set();
  for(var i = 0; i < questions.length; i++) {
    for(var k = 0; k < questions[i].answers.length; k++) {
      contained.add(questions[i].answers[k].next_question);
    }
  }

  var to_return = [];
  for(var i = 0; i < questions.length; i++) {
    if(!contained.has(questions[i].id)) {
      to_return.push(questions[i].id);
    }
  }
  return to_return.sort((a, b) => { return a.id - b.id; });
}

function initQueue(currTask) {
  var topictree = currTask.topictree;
  var topic = {};
  for(var i = 0; i < topictree.length; i++) {
    if(topictree[i].id == currTask.topTopicId) {
      topic = topictree[i];
      break;
    }
  }
  var to_return = [-1];
  to_return = to_return.concat(addNonContingentQuestions(topic.questions));
  return to_return;
}

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

    dispatch({type: 'CLEAR_ANSWERS'});
    dispatch({type: 'UPDATE_QUEUE', questions: initQueue(taskDB[taskId])});
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

export function runNextTask() {
  return (dispatch, getState) => presentTask(dispatch, getState);
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

export function updateQueue(questions, question_type) {
  if(question_type == 'SELECT_SUBTOPIC') {
    questions = addNonContingentQuestions(questions);
  }
  return {
    type: 'UPDATE_QUEUE',
    questions
  };
}

export function removeElemQueue(questions) {
  return {
    type: 'REMOVE_QUEUE',
    questions
  };
}

