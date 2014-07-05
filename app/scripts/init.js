({
  url: 'http://text-thresher.herokuapp.com/tasks',

  getArticleText: function() {
    var that = this;
    $.get(this.url)
      .success(function (data) {
        that.insertArticleText(JSON.parse(data));
      })
      .fail(function (e) {
        console.log(e)
      });
  },

  insertArticleText: function(data) {
    var offsets = data.tua.offsets[0],
        tua = '<strong>';

    tua += data.text.substring(offsets.start, offsets.stop) + '</strong>';
    $('.article-text').append(tua);
  },

  init: function() {
    this.getArticleText();
  }

}).init();
