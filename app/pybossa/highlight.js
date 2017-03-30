'use strict';

// PybossaJS docs at http://pybossajs.readthedocs.io/en/latest/library.html

// Key thing to understand is that runPybossaTasks is only run once
// per task queue, NOT once per task.
// However, runPybossaTask configures callback functions that run once
// per task.
// So functions provided to loadUserProgress, taskLoaded and presentTask
// retain access to the redux actions they need to update application
// state as part of their closure.

function getProjectName() {
  // Assuming an URL like this:
  // http://crowdcrafting.org/project/TextThresherHighlighter/task/1532993
  var urlpath = window.location.pathname;
  var elements = urlpath.split('/');
  if (elements.length >= 3 && elements[1] === 'project') {
    return elements[2];
  } else {
    return 'TextThresherHighlighter';
  }
}

export default function fetchPybossaHighlights(container) {
  function loadUserProgress() {
    pybossa.userProgress(getProjectName()).done(function(data){
      // Dispatch this info to the redux store for display
      // storePercentComplete(data); #TODO
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
    if ( !$.isEmptyObject(task) ) {
      loadUserProgress();
      // Update redux store with info
      container.props.storeProject(task.info.project);
      container.props.storeTopics(task.info.topics);
      container.props.storeArticle(task.info.article);

      function onSaveAndNext(highlights) {
        pybossa.saveTask(task.id, highlights).done(function() {
          deferred.resolve(task);
        });
      };
      // This is the tricky part. Each time we load a new task into
      // the store, we also provide this callback that the UI button
      // can use to call the function above to save the data and trigger
      // loading the next task with the deferred.resolve(task) call.
      container.props.storeSaveAndNext(onSaveAndNext);
    } else {
      // Displatch to store saying we are done with tasks
      // storeTasksDone() #TODO
      container.props.storeSaveAndNext( ()=> {} );
    }
  });

  // pybossa.setEndpoint('http://server/pybossa');
  pybossa.run(getProjectName());
}
