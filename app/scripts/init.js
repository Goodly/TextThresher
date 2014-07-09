// var textThresher = textThresher || {};
// textThresher.ajaxCache = {};

({

  url: 'http://text-thresher.herokuapp.com/tasks',

  getArticleText: function() {
    var that = this;
    $.get(this.url)
      .success(function(data) {
        var annotated = $(document.body).annotator(),
            optionsRichText = {
            tuaData: data,
            tinymce: {
              selector: "li.annotator-item textarea",
              plugins: "media image insertdatetime link code",
              menubar: false,
              toolbar_items_size: 'small',
              extended_valid_elements : "iframe[src|frameborder|style|scrolling|class|width|height|name|align|id]",
              toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media rubric | code ",
            }
          };

        that.insertArticleText(JSON.parse(data));
        that.setupTopicsBar(JSON.parse(data));
        annotated.annotator('addPlugin','QuestionTree', optionsRichText);

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

  init: function() {
    this.getArticleText();
  },

}).init();
