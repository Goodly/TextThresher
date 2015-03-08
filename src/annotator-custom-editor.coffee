Annotator.Plugin.CustomEditor = class CustomEditor extends Annotator.Plugin

  pluginInit: ->
    @annotator
      .subscribe 'beforeAnnotationCreated', (annotation) =>
        @customSetup annotation
      .subscribe 'annotationCreated', (annotation) =>
        @newCustomMethod annotation
      .subscribe 'annotationUpdated', (annotation) =>
        @newCustomMethod annotation
      .subscribe 'annotationDeleted', (annotation) =>
        @newCustomMethod annotation

  customSetup: (annotation) ->
    console.log @options

  newCustomMethod: (annotation) ->
    console.log annotation
