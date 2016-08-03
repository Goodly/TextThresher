How the code in this repo works
===
Hi! Glad you want to add code to this project. First, a brief overview of what's gone into this repo and some suggestions on how to get started using it.

The frontend stack
---
* Redux
* React
* ES6
* Sass
* Webpack

Formally, this repo contains a Redux app written with ES6 javascript and styled using Sass, served with hotloading and module support from webpack. It relies on a backend with a RESTful API found [here](https://github.com/Goodly/text-thresher-backend) which is a Django server running PostgreSQL in Docker.

Uh, where does the code even start?
---
`index.js` adds a root React component, which contains a `<Router>` which uses `routes.js` to decide what React component to render as its child. On the first load this is probably `App` from `app.js`, but even if it isn't when `app.js` was loaded it called `configureStore` from `appStore.js` which set up Redux. This in turn initializes the reducers, which perform the proper (synchronous for now) API calls from `api.js` to the back end so there's data to display.

What's React?
---
The React docs aren't so great - think of it as a extension to Javascript which allows you to write markup inline with logic, and treat view code like funnels which accept data and produce the correct visual change.

What's Redux?
---
Redux is a framework exceptionally good for building understandable and manageable UIs, because of it's unified state, unidirectional data flow, and pure functional mutations of state. The Redux docs ARE good, and you should read them until at least like the section labeled 'Advanced'. This one is the hardest to understand, after React. Read up and ask questions.

I've written a somewhat helpful gist on React and Redux [here](https://gist.github.com/phorust/b4e61af8600f0b2843675f926a9f8ee0).

What's ES6?
---
Pretty dope. It's the next language spec of Javascript, made available now by the lovely developer community making babel, which transpiles ES6 to ES5 (the current js spec). It got renamed to ES2016 but no one uses that name. Basically now, if you have the feeling there's a better way to do what you're doing, there probably is: lambdas, classes, helper functions, better iterators and packing / unpacking.

What's Sass?
--
Syntactically Awesome StyleSheets - one of the leading preprocessors of CSS, it compiles? (people use this word way too losely) to plain CSS but makes writing stylesheets not a pain. Variables, calculations, mixins, and nesting (!!) all help CSS scale way better.

What's Webpack?
---
Man this one is hard. In the beginning there was nothing, and then people said wait javascript projects are getting big we should make a build system for javascript. Grunt was born, and compared to previous approaches it was revolutionary - instead of a fat IDE, instead of a build configuration file, you wrote actual code, which would execute and allowed you to be prescriptive rather than descriptive (I think there's two better words to use but I forget) about your build process. Then, people got tired of writing big gruntfiles, so they said hey let's use Gulp and started writing big gulpfiles instead. Gulp has ... better piping and IO redirection, so your tasks can be more powerful? Then, people got tired of the benefits of writing programmatic build files instead of configuration files and went back to writing huge configuration files and started using webpack. The main benefit of webpack is it's extremely powerful hot module reloading and the efficiency with which it detects, packages, and sends over changes and modules. Webpack files are especially gross and hard to understand but... these benefits are worth it.

If you can't tell I still personally use grunt or gulp and I'm tired of spending more time writing effecient and cutting edge boilerplate than writing applications.

What's ____?
---
I've tried to enumerate all the interesting and useful parts of all the above, so that you can Google the pieces easily. Developer support for this stuff is all great since it's pretty much cutting edge and widely accepted as the way to go. The only thing we're not doing which would be great but not possible (Python has too many benefits for research) is isomorphic Redux, which just means the server also is in javascript and runs redux.