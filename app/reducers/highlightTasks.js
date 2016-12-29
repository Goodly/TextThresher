const initialState = Object.assign({
  pagedTasks: {},
  taskDatabase: {},
  taskQueue: [],
  currentTaskId: undefined
}, {});

export function highlightTasks(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_HIGHLIGHT_TASKS':
      return {
        ...state,
        pagedTasks: {
          isFetching: true
        },
        taskQueue: [],
        currentTaskId: undefined
      }
    case 'FETCH_HIGHLIGHT_TASKS_SUCCESS':
      return {
        ...state,
        pagedTasks: action.pagedTasks,
        taskDatabase: action.taskDatabase,
        currentTaskId: undefined
      }
    case 'UPDATE_HIGHLIGHT_TASK_QUEUE':
      return {
        ...state,
        taskQueue: action.taskQueue.slice()
      }
    case 'CURRENT_HIGHLIGHT_TASK':
      return {
        ...state,
        currentTaskId: action.taskId
      }
    case 'FETCH_HIGHLIGHT_TASKS_FAIL':
      // TODO: Put a helpful error message in the UI.
      throw action.error;
    default:
      return state;
  }
}
