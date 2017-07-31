export function getProjectName() {
  // Assuming an URL like this:
  // http://crowdcrafting.org/project/TextThresherQuiz/task/1532993
  var urlpath = window.location.pathname;
  var elements = urlpath.split('/');
  if (elements.length >= 3 && elements[1] === 'project') {
    return elements[2];
  } else {
    return 'CantFindProjectInURL';
  }
}
