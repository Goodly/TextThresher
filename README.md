# annotator-content-analysis
Extends the jQuery Annotator plugin to allow for custom logic queries on each annotation

####To setup

Ensure you have **bower**, **livereload**, and **testem** installed as NPM globals. Otherwise, if you're not sure, run:

```
npm install -g bower livereload testem node-sass
```

Then, from the project directory, run

```
npm install
bower install
```

####To develop

Run `testem` in a shell from the project dir and let the testem watcher compile changes from the `src` directory to the `tmp` folder.

The demo will be available at `http://localhost:7357/demo/index.html`

Unit tests will be at `http://localhost:7357/`

#####This project also uses `livereload` to recompile the project automatically as you work.

To use run `livereload` in a separate shell window in the project dir, or run `livereload $YOUR_PROJECT_DIR` from any shell location.

If you choose not to use livereload, the browser will complain that `GET http://localhost:35729/livereload.js net::ERR_ADDRESS_UNREACHABLE`. This is expected and won't affect development.

####To deploy

Run `npm run deploy` and the output files will be written to the `lib` directory.


####NOTES:
* Make changes ONLY to the ES6 `js` file in the `src`, not to `js` in `lib`. The lib is compiled down to run in modern browsers by `testem`.
