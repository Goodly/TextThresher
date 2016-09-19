function getInitialState() {
  return {
    currentArticle: null,
  };
}

export function article(state = initialState, action) {
  console.log('action')
  console.log(action)
  switch (action.type) {
    case 'PASS_TOPIC_TO_PICKER':
      return Object.assign({}, state, { currentTopic: action.topic });
  }
}
