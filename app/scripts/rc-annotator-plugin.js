Annotator.Plugin.Message = function (element, message) {
  var plugin = {};

  plugin.pluginInit = function () {
      this.annotator.viewer.addField({
        load: function (field, annotation) {
          field.innerHTML = message;
        }
      })
  };

  return plugin;
}