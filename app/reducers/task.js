const initialState = {
  task: {},
  saveAndNext: () => {},
  progress: {},
  done: false,
};

export function task(state = initialState, action) {
  switch (action.type) {
    case 'SAVE_TASK':
      return {
        ...state,
        info: action.info
      }
    case 'SAVE_TASK_CALLBACK':
      return {
        ...state,
        saveAndNext: action.saveAndNext
      }
    case 'TASK_PROGRESS':
      return {
        ...state,
        progress: action.progress
      }
    case 'TASK_DONE':
      // Don't reset progress stats!
      return {
        ...state,
        task: {},
        saveAndNext: () => {},
        done: true
      }
    default:
      return state;
  }
}
