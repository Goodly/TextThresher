const initialState = Object.assign({
  topics: {
    results: []
  },
  currentTopicId: 0
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
      topics: action.response,
      currentTopicId: action.response.results.length > 0 ?
                      action.response.results[0].id : 0
    }
    default:
      return state;
  }
}
