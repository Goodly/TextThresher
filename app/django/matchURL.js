// Javascript version of regex for API endpoint in thresher.urls
// Don't anchor at end with $, as it could have a query string.
let article_view_pattern = new RegExp('/article/view/([0-9]+)');

export function getArticleViewId(urlpath) {
  let match = article_view_pattern.exec(urlpath);
  if (match && match.length === 2) {
    return Number(match[1]);
  } else {
    throw new Error("Expected URL containing '/article/view/id'");
  }
}
