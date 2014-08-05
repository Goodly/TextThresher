({

  url: 'http://text-thresher.herokuapp.com',
  // url: 'http://localhost:1337',

  getArticleText: function() {
    var that = this;
    $.get(this.url + '/tasks')
      .success(function(data) {
        data = JSON.parse(data)
        var annotated = $(document.body).annotator(),
            options = {
              tuaData: data,
              destination: this.url + ''
            };

        that.insertArticleText(data);
        that.setupTopicsBar(data);
        that.setupGlossary(data);
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
      $('<th>').html(topic.name).appendTo('.topic-names').attr('id', slugify(topic.name));
      topic.questions.forEach(function(question) {
        $('<tr>').html('<td>' + question.text + '</td>').appendTo('.topic-questions').attr('id', 'question-id_' + question.id);
      })
    })
  },

  setupGlossary: function(data) {
    Object.keys(data.glossary).forEach(function(key, i, o) {
      $('<tr>').html('<td>' + key + '</td><td>' + data.glossary[key] + '</td>').appendTo('.table-glossary');
    })
  },

  init: function() {
    this.getArticleText();
  },

}).init();
