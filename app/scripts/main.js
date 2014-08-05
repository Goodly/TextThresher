// var annotated = $(document.body).annotator();
$(function(){
  var allText = false;
  $('.show-all-text').on('click', function() {
    if (!allText) {
      allText = true;

      var text = $('.all-the-text').html(),
          start = $('.start').html(),
          stop = $('.stop').html();

      $(this).hide()

      $('.article-text').children().remove();
      // console.log(begin, end)

      $('.article-text').append('<span class="article-prefix">' + text.substring(0, start) + '</span>');
      $('.article-text').append('<strong>' + text.substring(start, stop) + '</strong>');
      $('.article-text').append('<span class="article-suffix">' + text.substring(stop, text.length - 1) + '</span>');

    }
  })
})

var slugify = function (text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

