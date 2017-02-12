const initialState = Object.assign({
  taskDatabase: {},
  taskQueue: [],
}, {});

export function quizTasks(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_QUIZ_TASKS':
      return {
        ...state,
        taskQueue: [],
      }
    case 'FETCH_QUIZ_TASKS_SUCCESS':
      return {
        ...state,
        taskDatabase: action.taskDatabase,
      }
    case 'UPDATE_QUIZ_TASK_QUEUE':
      return {
        ...state,
        taskQueue: action.taskQueue.slice()
      }
    case 'FETCH_QUIZ_TASKS_FAIL':
      // TODO: Put a helpful error message in the UI.
      throw action.error;
    default:
      return state;
  }
}
