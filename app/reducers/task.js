const initialState = {
  done: false,
  saveAndNext: () => {},
};

export function task(state = initialState, action) {
  switch (action.type) {
    case 'SAVE_TASK_CALLBACK':
      return {
        ...state,
        saveAndNext: action.saveAndNext
      }
    case 'TASK_DONE':
      return {
        ...state,
        done: true
      }
    default:
      return state;
  }
}
