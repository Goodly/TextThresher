Text Thresher
=============

A tool for decomposing and annotating articles using the crowd. Under development for the [Deciding Force Project](http://www.decidingforce.org/).

Uses the [AnnotatorJS](http://annotatorjs.org/) plugin.

#### Running the app locally

– requires nodejs and npm

– clone the repository

– `$ npm install`

– `$ grunt server`

visit the app at (http://localhost:9000)

markup is generated using Jade

#### Deployment

– `$ divshot login`

– commit changes to working branch

– `$ grunt build && divshot push`

