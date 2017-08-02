const initialState = {
  name : "",
  description : ""
};


export function project(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_PROJECT_SUCCESS':
      const project = action.response.results[0];
      if ( ! project.description) {
        project.description = '';
      };
      if ( ! project.long_description) {
        project.long_description = '';
      };
      return {
        ...state,
        name: project.name,
        short_name: project.short_name,
        description: project.description,
        long_description: project.long_description,
        created: project.created,
        updated: project.updated,
        pybossa_owner_id: project.owner_id,
      };
    
    default:
      return state;
    }
}
