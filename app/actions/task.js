export function storeTask(task) {
  return {
    type: 'SAVE_TASK',
    task
  };
}

export function storeSaveAndNext(saveAndNext) {
  return {
    type: 'SAVE_TASK_CALLBACK',
    saveAndNext: saveAndNext
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
    type: 'TASK_DONE',
  }
}
