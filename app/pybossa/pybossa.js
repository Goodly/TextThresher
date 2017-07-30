// PybossaJS docs at http://pybossajs.readthedocs.io/en/latest/library.html

// Key thing to understand is that runPybossaTasks is only run once
// on initial page load, NOT once per task.
// However, runPybossaTask configures callback functions that run once
// per task.
// So functions provided to loadUserProgress, taskLoaded and presentTask
// retain access to the redux actions they need to update application
// state as part of their closure.

import { getProjectName } from 'pybossa/getprojectname';

export default function runPybossaTasks(container) {
  function loadUserProgress() {
    pybossa.userProgress(getProjectName()).done(function(data){
      container.storeProgress(data);
    });
  }

  pybossa.taskLoaded(function(task, deferred) {
    if ( !$.isEmptyObject(task) ) {
      // If we have to retrieve additional info, augment task here
      // Forward task to presentTask once additional info ready
      deferred.resolve(task);
    } else {
      // Forward the empty task to presentTask to notify user we are done
      deferred.resolve(task);
    }
  });

  pybossa.presentTask(function(task, deferred) {
    loadUserProgress();
    if ( !$.isEmptyObject(task) ) {
      function onSaveAndNext(answers) {
        pybossa.saveTask(task.id, answers).done(function() {
          deferred.resolve(task);
        });
      };
      // Give task to container so it can update redux store
      // onSaveAndNext is the tricky part. Each time we load a new task into
      // the store, we also provide this callback that the UI button
      // can use to call the function above to save the taskrun and trigger
      // loading the next task with the deferred.resolve(task) call.
      container.storeTask(task, onSaveAndNext);
    } else {
      // No more tasks
      container.storeTask(null, ()=>{} );
    }
  });

  // pybossa.setEndpoint('http://server/pybossa');
  pybossa.run(getProjectName());
}
