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

export function showHelp(showHelpFlag) {
  return {
    type: 'SHOW_HELP',
    showHelpFlag
  }
}

export function storeTasksDone() {
  return {
    type: 'TASKS_DONE',
  }
}
