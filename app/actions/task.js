export function storeTask(task, saveAndNext) {
  return {
    type: 'SAVE_TASK',
    task,
    saveAndNext,
  };
}

export function storeProgress(progress) {
  return {
    type: 'TASK_PROGRESS',
    progress
  }
}

export function storeTasksDone() {
  return {
    type: 'TASKS_DONE',
  }
}
