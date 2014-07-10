// var textThresher = textThresher || {};
// textThresher.ajaxCache = {};

({

  url: 'http://text-thresher.herokuapp.com/tasks',

  getArticleText: function() {
    var that = this;
    $.get(this.url)
      .success(function(data) {
        data = JSON.parse(data)
        var annotated = $(document.body).annotator(),
            options = {
              tuaData: data,
            };

        that.insertArticleText(data);
        that.setupTopicsBar(data);
        annotated.annotator('addPlugin','QuestionTree', options);

      })
      .fail(function(e) {
        console.log(e)
      });
  },

  insertArticleText: function(data) {
    var offsets = data.tua.offsets[0],
        tua = '<strong>';

    tua += data.text.substring(offsets.start, offsets.stop) + '</strong>';
    $('.article-text').append(tua);
  },

  setupTopicsBar: function(data) {
    data.topics.forEach(function(topic) {
      $('<th>').html(topic.name).appendTo('.topic-names').attr('id', topic.name + '-header');
      topic.questions.forEach(function(question) {
        // if (question.top) {
          $('<tr>').html(question.text).appendTo('.topic-questions').attr('id', 'question-id_' + question.id);
        // }
      })
    })
  },

  buildModals: function(data) {

  },

  init: function() {
    this.getArticleText();
  },

}).init();
