function annotatorCustomEditor(options){
  return {
    start: function() {
      this.options = options;
      this.getDataPayload();
    },

    // ajax get to retrieve data
    getDataPayload: function(){
      $.get(this.options.endpoint, (data) => {
        this.configureData(data);
      })
    },

    // method to model our raw data payload
    // @param value [object] API payload returned via AJAX
    //
    configureData: function(value){
      // TODO: establish how we want to configure the data
      this.data = {
        next: value.next,
        previous: value.previous,
        glossary: value.results[0].analysis_type.glossary
      }
    },

    // hooks into Annotator lifecycle events
    //
    // TODOS:
    //  • how to create our own UI
    //  • how best to store our answers to interact with other plugins
    //  • how to pause the annotator lifecycle?
    beforeAnnotationCreated: function(annotation){
      return this.promiseHelper(annotation)
        .then((value) => {
          this.setUpCustomEditorPanel(value);
        });
    },

    setUpCustomEditorPanel: function(annotation) {
      console.log(annotation);
    },

    // helper promise function for intercepting Annotator UI
    //
    promiseHelper: function(annotation) {
      return new Promise((resolve, reject) => {
        let value = annotation
        resolve(value);
      })
    }

  }
}
