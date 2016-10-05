export function fetchTopics() {
  return (dispatch) => {
    dispatch({ type: 'FETCH_TOPICS'});

    return fetch(`http://192.168.99.100:5000/api/topics/?format=json`)
      .then(response => response.json())
      .then(
        (response) => dispatch({ type: 'FETCH_TOPICS_SUCCESS', response}),
        (error) => dispatch({ type: 'FETCH_TOPICS_FAIL', error})
      );
  };
}

export function activateTopic(topicId) {
  return {
    type: 'ACTIVATE_TOPIC',
    currentTopic: topicId
  }
}
