export function initHighlightTasks() {
  return { type: 'FETCH_HIGHLIGHT_TASKS' };
}

export function storeHighlightTasksDB(pagedTasks, taskDatabase) {
  return { type: 'FETCH_HIGHLIGHT_TASKS_SUCCESS',
           pagedTasks,
           taskDatabase
  };
}

export function storeHighlightQueue(taskQueue) {
  return { type: 'UPDATE_HIGHLIGHT_TASK_QUEUE',
           taskQueue
  };
}

export function errorHighlightTasks(error) {
  return { type: 'FETCH_HIGHLIGHT_TASKS_FAIL',
           error
  };
}
