
import axios from 'axios';

//probably wrong
//TODO: Fix dis shit
/*export function postHighlights(highlights) {
  //highlights.map(function(highlight){
  console.log("POST HIGHLIGHTS")
  console.log(highlights)
  axios.post("/post_highlights/", JSON.parse(highlights)).then(
    function (response) {
      console.log("in parse")
      console.log(response)
    }
  )
}*/

export function fetchArticle(articleId, page) {
  return (dispatch) => {
    dispatch({ type: 'FETCH_ARTICLE', articleId});
    return fetch(page)
      .then(response => response.json())
      .then(
        (response) => {
          var fetch_next = false;
          for (var entry in response.results) {
            var article = response.results[entry];
            if (article.article_id == articleId) {
               fetch_next = true;
               var curr = article;
            } else if (fetch_next) {
              var next = article.article_id;
              break;
            }
          }
          if (next == null) {
            page = response.next
            fetch(page)
              .then(response => response.json())
              .then(
                (response) => {
                  next = response.results[0].article_id
                  var newpage =  page;
                  dispatch({type: 'FETCH_ARTICLE_SUCCESS', curr, next, newpage}),
                  (error) => dispatch({ type: 'FETCH_ARTICLE_FAIL', error})
                }
              )
          } else {
            var newpage =  page;
            dispatch({type: 'FETCH_ARTICLE_SUCCESS', curr, next, newpage}),
            (error) => dispatch({ type: 'FETCH_ARTICLE_FAIL', error})
          }
        }
      );
  };
}

export function fetchTopic() {
  return (dispatch) => {
    dispatch({ type: 'FETCH_TOPIC'});
    //return fetch(`http://192.168.99.100:5000/api/topics/${topicId}/?format=json`) // TODO: resolve this absolute URL issue with backend
    return fetch(`http://192.168.99.100:5000/api/topics/`)
      .then(response => response.json())
      .then(
        (response) => dispatch({ type: 'FETCH_TOPIC_SUCCESS', response}),
        (error) => dispatch({ type: 'FETCH_TOPIC_FAIL', error})
      );
  };
}

export function getArticle(articleId) {
  return {
    type: 'GET_ARTICLE',
    articleId
  };
}

export function activateTopic(topic) {
  return { type: 'ACTIVATE_TOPIC', topic };
}
