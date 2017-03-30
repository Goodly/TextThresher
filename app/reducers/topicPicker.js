const initialState = {
  topics: {
    results: []
  },
  currentTopicId: 0,
  lookupTopicById: { '0': [0, { instructions: '' }] }
};

function indexTopicById(topicList) {
  var lookup = {};
  topicList.forEach( (topic, index) => {
    lookup[topic.id] = [index, topic];
  });
  return lookup;
}

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
        currentTopicId: (action.response.results.length > 0 ? action.response.results[0].id : 0),
        lookupTopicById: indexTopicById(action.response.results)
      }
    default:
      return state;
  }
}
