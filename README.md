# annotator-custom-editor
Extends the jQuery Annotator plugin to allow for custom logic queries on each annotation

####To setup
```
npm install
bower install
```

####To develop

```
testem
```
Run `testem` in the terminal and let the testem watcher compile changes from the `src` directory to the `lib` folder 

 
####>GOTCHAS:
**Only make changes to the `coffee` file in the `src`, not to `js` in `lib`.
Don't have a compatible set of browsers or want to test against something else? Change the browsers tested against in `testem.json`**
