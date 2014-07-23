({

  url: 'http://text-thresher.herokuapp.com/tasks',
  // url: 'http://localhost:1337/tasks',

  getArticleText: function() {
    var that = this;
    $.get(this.url)
      .success(function(data) {
        data = JSON.parse(data)
        var annotated = $(document.body).annotator(),
            options = {
              tuaData: data,
              destination: 'url endpoint'
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
      $('<th>').html(topic.name).appendTo('.topic-names').attr('id', slugify(topic.name) + '-header');
      topic.questions.forEach(function(question) {
        // if (question.top) {
          $('<tr>').html(question.text).appendTo('.topic-questions').attr('id', 'question-id_' + question.id);
        // }
      })
    })
  },

  init: function() {
    this.getArticleText();
  },

}).init();
