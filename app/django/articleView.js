// This network fetch code runs on a Django generated page,
// and calls a Django API endpoint. It never runs on a Pybossa page.

const { fetch, Request, Response, Headers } = require('fetch-ponyfill')();
import { normalize, schema } from 'normalizr';

let debug = require('debug')('thresher:articleView');

let highlight = new schema.Entity('highlights');
let highlightTaskRun = new schema.Entity('taskRuns', {
  highlights: [ highlight ]
});
let article = new schema.Entity('articles', {
  highlight_taskruns: [ highlightTaskRun ]
});

export default function fetchArticleView(reduxActions, articleFetchURL) {
  reduxActions.initArticleView();
  return fetch(articleFetchURL)
    .then(response => response.json())
    .then(articleWithAnnotations => {
      let normalizedData = normalize(articleWithAnnotations, article);
      reduxActions.storeArticleView(normalizedData);
    }).catch( error => {
      reduxActions.errorArticleView(error);
    });
}
