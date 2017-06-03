// This code is only used with 'npm run dev' for getting tasks from Django
// It never runs on Pybossa!

const { fetch, Request, Response, Headers } = require('fetch-ponyfill')();

import { normalize, Schema, arrayOf } from 'normalizr';

let taskSchema = new Schema('tasks');
let taskList = { results: arrayOf(taskSchema) };

function storeTasks(container, pagedTasks) {
  // Django backend doesn't provide task ids, so copy article id as the task id
  pagedTasks.results = pagedTasks.results.map(
    (task) => ({...task, id: task.article.id})
  );
  // Normalize data structure
  const taskDatabase = normalize(pagedTasks, taskList);
  // Replace or push task IDs to queue
  container.props.storeHighlightTasksDB(pagedTasks, taskDatabase);
  // Make a copy of the unique task Ids collected by normalize
  let taskQueue = taskDatabase.result.results.slice();
  container.props.storeHighlightQueue(taskQueue);
}

function presentTask(container) {
  const taskStore = container.props.djangoHighlightTasks;
  const taskDB = taskStore.taskDatabase.entities.tasks;
  let taskQueue = taskStore.taskQueue.slice();
  if (taskQueue.length > 0) {
    const taskId = taskQueue.shift();
    const task = taskDB[taskId];
    container.props.storeHighlightQueue(taskQueue);

    container.props.storeProject(task.project);
    container.props.storeArticle(task.article);
    container.props.storeTopics(task.topics);

    function onSaveAndNext(highlights) {
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
    console.log('No more tasks.');
    throw new Error('No more tasks.');
  }
}

export default function fetchHighlightTasks(container, pageParam) {
  container.props.initHighlightTasks();
  let host = "http://localhost:5000";
  pageParam = pageParam ? pageParam : '';
  return fetch(host + `/api/highlighter_tasks/?format=json${pageParam}`)
    .then(response => response.json())
    .then(pagedTasks => {
            storeTasks(container, pagedTasks);
            presentTask(container);
          },
          error => container.props.errorHighlightTasks(error)
    )
}
