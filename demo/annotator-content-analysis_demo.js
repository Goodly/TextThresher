$(function() {

  var options = {
    endpoint: 'https://text-thresher.herokuapp.com/api/tuas/random/?format=json',
    data: '',
    config: {
      foo: 'bar'
    }
  }

  var app = new annotator.App();

  app.include(annotator.ui.main, {
    viewerExtensions: [annotator.ui.tags.viewerExtension]
  });

  app.include(annotatorCustomEditor, options);

  app.start();

});
