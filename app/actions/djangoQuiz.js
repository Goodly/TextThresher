export function initQuizTasks() {
  return { type: 'FETCH_QUIZ_TASKS' };
}

export function storeQuizTasksDB(pagedTasks, taskDatabase) {
  return { type: 'FETCH_QUIZ_TASKS_SUCCESS',
           pagedTasks,
           taskDatabase
  };
}

export function storeQuizQueue(taskQueue) {
  return { type: 'UPDATE_QUIZ_TASK_QUEUE',
           taskQueue
  };
}

export function errorQuizTasks(error) {
  return { type: 'FETCH_QUIZ_TASKS_FAIL',
           error
  };
}
