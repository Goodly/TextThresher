const initialState = Object.assign({
  topics: {},
  currentTopic: null
}, {});

export function topicPicker(state = initialState, action) {
  switch (action.type) {
    case 'ACTIVATE_TOPIC':
    return {
      ...state,
      currentTopic: action.currentTopic,
    }
    case 'FETCH_TOPICS_SUCCESS':
    return {
      ...state,
      topics: action.response
    }
    default:
      return state;
  }
}
