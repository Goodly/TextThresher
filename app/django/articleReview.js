// This network fetch code runs on a Django generated page,
// and calls a Django API endpoint. It never runs on a Pybossa page.

const { fetch, Request, Response, Headers } = require('fetch-ponyfill')();

import { normalize, schema } from 'normalizr';

let highlight = new schema.Entity('highlights');
let highlightTaskRun = new schema.Entity('taskRuns', {
  highlights: [ highlight ]
});
let article = new schema.Entity('articles', {
  highlight_taskruns: [ highlightTaskRun ]
});

export default function fetchArticleReview(reduxActions, articleFetchURL) {
  reduxActions.initArticleReview();
  return fetch(articleFetchURL)
    .then(response => response.json())
    .then(articleWithAnnotations => {
            let normalizedData = normalize(articleWithAnnotations, article);
            reduxActions.storeArticleReview(normalizedData);
          },
          error => reduxActions.errorArticleReview(error)
    )
}
