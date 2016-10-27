export function fetchProject() {
  return (dispatch) => {
    dispatch({ type: 'FETCH_PROJECT'});

    return fetch(`http://localhost:5000/api/projects/?format=json`)
      .then(response => response.json())
      .then(
        (response) => dispatch({ type: 'FETCH_PROJECT_SUCCESS', response}),
        (error) => dispatch({ type: 'FETCH_PROJECT_FAIL', error})
      );
  };
}
