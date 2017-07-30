// jQuery Ajax returns a Deferred, which is a superset of Promise
// recommend to use .then Promise API on returned jqXHR object

// Function to get project name from current URL
import { getProjectName } from 'pybossa/getprojectname';

const url = '/';

export function fetchProject(projectname) {
  return $.ajax({
    url: url + 'api/project',
    data: 'all=1&short_name='+projectname,
    dataType:'json'
  });
}

export function getUpdatedProject(storeProject) {
  fetchProject(getProjectName()).then(
    (projectList) => {
      let project = projectList[0];
      if (project.info && project.info.task_presenter) {
        // Remove multi-megabyte task presenter cause wasteful.
        // Wish there was a way to retrieve the project info
        // without the task_presenter field because this
        // is a redundant network load of 3 to 5 MB.
        project.info.task_presenter = '';
      };
      storeProject(projectList[0]);
    }
  );
}
