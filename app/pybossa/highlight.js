'use strict';

export default function pybossaHighlight(storeArticle, storeProject, storeTopics) {
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
      storeProject(task.info.project);
      storeTopics(task.info.topics);
      storeArticle(task.info.article);

      var onSaveAndNext = function () {
        // obtain answer from redux store
        var highlights = [
                           { articleHighlight: task.article.id,
                             case_number: 1,
                             offsets: [[10,18],[30,38]],
                             highlightText: ["New York", "Brooklyn"]
                           },
                           { articleHighlight: task.article.id,
                             case_number: 2,
                             offsets: [[60,68],[70,78]],
                             highlightText: ["Bay Area", "East Bay"]
                           }
                         ];
        pybossa.saveTask(task.id, highlights).done(function() {
          deferred.resolve(task);
        });
      };
    } else {
      // Displatch to store saying we are done with tasks
      // storeTasksDone() #TODO
      // Nothing more to fetch
      return () => {};
    }
  });

  pybossa.run(getProjectName());

  // TODO: return saveAndNext action
  return () => {};
}
