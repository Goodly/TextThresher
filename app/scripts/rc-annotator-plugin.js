// we will pass in an options object containing all necessary information to build the question tree
// this will require analyzing the JSON for the logic

Annotator.Plugin.Message = function (element, message) {
  var plugin = {};

  plugin.pluginInit = function () {
    // debugger
      this.annotator.editor.addField({
        load: function (field, annotation) {
          field.innerHTML = message;
        }
      })
  };

  return plugin;
}