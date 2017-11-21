import { displayStates } from 'components/displaystates';

const initialState = {
  task: {},
  saveAndNext: () => {},
  progress: {
    done: 0,
    total: 0
  },
  displayState: displayStates.BEFORE_LOAD,
  lastDisplayState: displayStates.BEFORE_LOAD,
  displayHintSelectControl: false,
  displayHintType: '',
};

export function task(state = initialState, action) {
  switch (action.type) {
    case 'SAVE_TASK':
      return {
        ...state,
        task: action.task,
        saveAndNext: action.saveAndNext,
        displayState: displayStates.TASK_LOADED,
      }
    case 'TASK_PROGRESS':
      return {
        ...state,
        progress: action.progress
      }
    case 'DISPLAY_HINT_SELECT':
      return {
        ...state,
        displayHintSelectControl: action.displayFlag
      }
    case 'SET_HINT_TYPE':
      return {
        ...state,
        displayHintType: action.hintType
      }
    case 'SHOW_HELP':
      if (action.showHelpFlag === true) {
        return {
          ...state,
          displayState: displayStates.SHOW_HELP,
          lastDisplayState: state.displayState
        };
      } else {
        return {
          ...state,
          displayState: state.lastDisplayState
        };
      };
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
