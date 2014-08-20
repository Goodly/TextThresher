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
        that.formatArticle();
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
        tua = '',
        // prefixString = '<span class="article-prefix">' + data.text.substring(0, offsets.start) + '</span>',
        suffixString = '<span class="article-suffix">' + data.text.substring(offsets.stop, data.text.length - 1) + '</span>';

    // tua += prefixString;
    tua += '<strong>' + data.text.substring(offsets.start, offsets.stop) + '</strong>';
    tua += suffixString;
    $('.article-text').append(tua);
    $('.all-the-text').append(data.text);
    $('.start').append(offsets.start);
    $('.stop').append(offsets.stop)
  },

  formatArticle: function(){
    // $('.article-prefix').dotdotdot({height: 50});
    $('.article-suffix').dotdotdot({height: 50});
  },

  setupTopicsBar: function(data) {
    data.topics.forEach(function(topic) {
      $('<th>').html(topic.name).appendTo('.topic-names').attr('id', slugify(topic.name));
      topic.questions.forEach(function(question) {
        $('<tr class="topic">').html('<td>' + question.text + '</td>').appendTo('.topic-questions').attr('id', 'question-id_' + question.id);
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
