$(function() {

  var options = {
    dataUrl: './tua.json',
    templates: {
      form: '/templates/form.handlebars',
      topic: '/templates/topic.handlebars',
      question: '/templates/question.handlebars',
      answer: '/templates/answer.handlebars'
    }
  }

  $.get(options.dataUrl, function (data) {
    options.data = data;
    setupData(data);
    setupAnnotator(options);
  });

  function setupData(data){
    $('.text').append(data.results[0].article.text)
  };

  function setupAnnotator(options){
    var app = new annotator.App()
      .include(aca.ui.main, {viewerExtensions: [annotator.ui.tags.viewerExtension], editorExtensions: options});

    app.start();
  };

});
