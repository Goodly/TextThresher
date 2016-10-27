const initialState = Object.assign({
  name : "",
  instruction : ""
}, {});


export function project(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_PROJECT_SUCCESS':
    return {
      ...state,
      name: action.response.results[0].name,
      instructions: action.response.results[0].instructions 
    }
    
    default:
      return state;
    }
}