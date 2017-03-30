// This code does not get used when running on a Pybossa page.
// Used only by app/django/quiz to manage a queue of tasks retrieved from Django
// It could be private state of app/django/quiz.js, but this way
// we can use ReduxTools to inspect the data.

const initialState = {
  pagedTasks: {},
  taskDatabase: {},
  taskQueue: []
};

export function djangoHighlightTasks(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_HIGHLIGHT_TASKS':
      return Object.assign({}, initialState, { isFetching: true });
    case 'FETCH_HIGHLIGHT_TASKS_SUCCESS':
      return {
        ...state,
        pagedTasks: action.pagedTasks,
        taskDatabase: action.taskDatabase,
        isFetching: false
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
