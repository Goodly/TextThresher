// This code is only used with 'npm run dev' for getting tasks from Django
// It never runs on Pybossa!

const { fetch, Request, Response, Headers } = require('fetch-ponyfill')();

import { normalize, schema } from 'normalizr';

let taskSchema = new schema.Entity('tasks');
let taskList = [taskSchema];

function storeTasks(container, pagedTasks) {
  // Actually, the paged quiz endpoint isn't ready yet, this is already a task list
  // Django backend doesn't provide task ids, so generate ids
  pagedTasks = pagedTasks.map(
    (task, index) => ({...task, id: index*10+5})
  );
  // Normalize data structure
  const taskDatabase = normalize(pagedTasks, taskList);
  // Replace or push task IDs to queue
  container.props.storeQuizTasksDB(pagedTasks, taskDatabase);
  // Make a copy of the unique task Ids collected by normalize
  let taskQueue = taskDatabase.result.slice();
  container.props.storeQuizQueue(taskQueue);
}

function presentTask(container) {
  const taskStore = container.props.djangoQuizTasks;
  const taskDB = taskStore.taskDatabase.entities.tasks;
  let taskQueue = taskStore.taskQueue.slice();
  if (taskQueue.length > 0) {
    const taskId = taskQueue.shift();
    const task = taskDB[taskId];
    container.props.storeQuizQueue(taskQueue);

    container.props.storeProject(task.project);
    container.props.storeQuizTask(task);

    function onSaveAndNext(answers) {
      // If we cared to implement saving to the mock back-end, we would
      // do it here.
      presentTask(container);
    }
    // Tricky part: We have loaded the task, now we also provide the
    // callback that the UI button can use to save the data and trigger
    // loading the next task.
    container.props.storeSaveAndNext(onSaveAndNext);
  } else {
    // TODO: update store with done flag and show nicely in UI
    // console.log('No more tasks.');
    // throw new Error('No more tasks.');
    container.props.storeTasksDone();
  }
}

export default function fetchQuizTasks(container) {
  container.props.initQuizTasks();
  let host = "http://localhost:5000";
  return fetch(host + `/api/quiz_tasks/?format=json`)
    .then(response => response.json())
    .then(
      pagedTasks => {
        storeTasks(container, pagedTasks);
        presentTask(container);
      },
      error => container.props.errorQuizTasks(error)
    )
}
