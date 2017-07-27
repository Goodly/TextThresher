export function storeSaveAndNext(saveAndNext) {
  return {
    type: 'SAVE_TASK_CALLBACK',
    saveAndNext: saveAndNext
  };
}

export function storeTasksDone() {
  return {
    type: 'TASK_DONE',
  }
}
