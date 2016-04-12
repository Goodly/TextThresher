# annotator-content-analysis
Provides an annotation interface for detailed text annotation by crowdworkers along researcher-defined topics of interest.

Built with (react)[https://facebook.github.io/react/] and (redux)[https://github.com/reactjs/redux].

####To setup

From the project directory, run

```
npm install
bower install
```
and
```
npm install -g gulp
```

You might also want the nifty (Redux DevTools)[https://github.com/zalmoxisus/redux-devtools-extension].

####To develop

Run `npm run dev` from the project dir to build and serve the development app.

The demo with mock data will be available at `http://localhost:3001/app/#/tua/0/topic/0/question/0`

####To deploy

Run `npm run deploy` and the output files will be written to the `dist` fodler.
