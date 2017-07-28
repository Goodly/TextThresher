const initialState = {
  name : "",
  description : ""
};


export function project(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_PROJECT_SUCCESS':
    return {
      ...state,
      name: action.response.results[0].name,
      description: action.response.results[0].description
    }
    
    default:
      return state;
    }
}
