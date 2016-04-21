import data from 'assets/tua.json';
import $ from 'jquery';

const USE_DOCKER = false;
let   BASE_URL   = 'http://text-thresher.herokuapp.com';
if (USE_DOCKER) {
  BASE_URL       = 'http://192.168.99.100:5000';
}
const ARTICLES_URL   = BASE_URL + '/api/articles/';
const HIGHLIGHTS_URL = BASE_URL + '/api/highlight_groups/';

export default class api {
  static getArticles() {
    // TODO: consider somehow not synch doing this
    var res = $.ajax({ url: ARTICLES_URL, async: false });
    if (res.status !== 200) {
      return { article: data.results };
    }
    // need to have conversation with backend about where these legacy properties
    // i.e. topics comes from
    var articles = [];
    res = JSON.parse(res.responseText);
    for (var article of res.results) {
      articles.push(Object.assign({},
        { article, analysis_type: { topics: [{ name: 'Event type' }] } })
      );
    }
    return articles;
  }

  static sendHighlights(highlights) {
    // TODO: finish this function
    $.ajax({ url: HIGHLIGHTS_URL,
             method: 'POST',
             data: highlights,
             success: _ => _ });
  }
}
