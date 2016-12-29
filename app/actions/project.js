export function storeProject(project) {
  return {
    type: 'FETCH_PROJECT_SUCCESS',
    response: {
      results: [project]
    }
  };
}
