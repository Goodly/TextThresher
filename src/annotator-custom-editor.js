Annotator.Plugin.CustomEditor = class CustomEditor extends Annotator.Plugin{
  pluginInit(){
    this.annotator
      .subscribe('beforeAnnotationCreated', annotation => {
        this.customSetup(annotation);
      })
      .subscribe('annotationCreated', annotation => {
        this.newCustomMethod(annotation);
      })
      .subscribe('annotationUpdated', annotation => {
        this.newCustomMethod(annotation);
      })
      .subscribe('annotationDeleted', annotation => {
        this.newCustomMethod(annotation);
      })

  }

  customSetup(annotation){
    console.log(annotation);
  }

  newCustomMethod(annotation){
    console.log(annotation);
  }

}
