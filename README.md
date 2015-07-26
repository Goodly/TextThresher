# annotator-content-analysis
Extends the jQuery Annotator plugin to allow for custom logic queries on each annotation

####To setup

Ensure you have **gulp** installed as an NPM global and that it's version 3.9 or higher. *v3.9+ supports es6 syntax in the gulpfile*

Otherwise run:

```
npm install -g gulp
```

Then, from the project directory, run

```
npm install
bower install
```

####To develop

Run `gulp` in one shell from the project dir to start the file watcher and `gulp test` in another to start the test and demo server.

The demo will be available at `http://localhost:7357/demo/index.html`

Unit tests from `http://localhost:7357/`

####To deploy

Run `npm run deploy` and the output files will be written to the `lib` directory. *(this will be deprecated and delegated to a gulp task in the future)*

####NOTES:
* Make changes ONLY to the ES6 `js` in the `src`. The `.tmp` and `lib` folders are compiled down to run in modern browsers by `gulp`.
