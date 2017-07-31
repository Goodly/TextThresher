import { displayStates } from 'components/displaystates';

const initialState = {
  task: {},
  saveAndNext: () => {},
  progress: {
    done: 0,
    total: 0
  },
  displayState: displayStates.BEFORE_LOAD,
};

export function task(state = initialState, action) {
  switch (action.type) {
    case 'SAVE_TASK':
      return {
        ...state,
        info: action.info,
        saveAndNext: action.saveAndNext,
        displayState: displayStates.TASK_LOADED,
      }
    case 'TASK_PROGRESS':
      return {
        ...state,
        progress: action.progress
      }
    case 'TASKS_DONE':
      // Don't reset progress stats - displayed in ThankYou component.
      return {
        ...state,
        task: {},
        saveAndNext: () => {},
        displayState: displayStates.TASKS_DONE,
      }
    default:
      return state;
  }
}
