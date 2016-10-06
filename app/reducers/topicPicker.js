const initialState = Object.assign({
  topics: {},
  currentTopicId: null
}, {});

export function topicPicker(state = initialState, action) {
  switch (action.type) {
    case 'ACTIVATE_TOPIC':
    return {
      ...state,
      currentTopicId: action.currentTopicId,
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
