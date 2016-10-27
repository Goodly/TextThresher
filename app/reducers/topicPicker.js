const initialState = Object.assign({
  topics: {
    results: []
  },
  currentTopicId: 0
}, {});

function mapIdToIndex(array) {
  var dic = {};
  for (var i = 0; i < array.length; i++) {
    var topic = array[i];
    dic[topic.id] = [i, topic];
  }
  return dic;
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
      idDict: mapIdToIndex(action.response.results)
    }
    default:
      return state;
  }
}
