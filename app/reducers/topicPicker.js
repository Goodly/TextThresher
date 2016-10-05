const initialState = Object.assign({
  topics: {},
  currentTopic: null
}, {});

export function TopicPicker(state = initialState, action) {
  console.log('topic picker reducer');
  switch (action.type) {
    case 'ACTIVATE_TOPIC':
    return Object.assign({}, state, { currentTopic: action.topic });
    /*return {
      ...state,
      currentTopic: action.currentTopic,
    }*/
    case 'FETCH_TOPICS_SUCCESS':
    return {
      ...state,
      topics: action.response
    }
    default:
      return state;
  }
}
