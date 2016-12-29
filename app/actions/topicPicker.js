export function activateTopic(topicId) {
  return {
    type: 'ACTIVATE_TOPIC',
    currentTopicId: topicId
  }
}

export function storeTopics(topics) {
  return {
    type: 'FETCH_TOPICS_SUCCESS',
    response: {
      results: topics
    }
  };
}
