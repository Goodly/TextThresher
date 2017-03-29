const initialState = {
  pagedTasks: {},
  taskDatabase: {},
  taskQueue: []
};

// Note that this reducer is just used for the managing a
// the MockHighlighter queue of tasks that comes from Django directly.
// This code does not get used when running on a Pybossa page.
export function highlightTasks(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_HIGHLIGHT_TASKS':
      return Object.assign({}, initialState, { isFetching: true });
    case 'FETCH_HIGHLIGHT_TASKS_SUCCESS':
      return {
        ...state,
        pagedTasks: action.pagedTasks,
        taskDatabase: action.taskDatabase
      }
    case 'UPDATE_HIGHLIGHT_TASK_QUEUE':
      return {
        ...state,
        taskQueue: action.taskQueue.slice()
      }
    case 'FETCH_HIGHLIGHT_TASKS_FAIL':
      // TODO: Put a helpful error message in the UI.
      throw action.error;
    default:
      return state;
  }
}
