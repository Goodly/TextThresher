"use strict";

function annotatorCustomEditor(options) {
  return {
    start: function start() {
      this.options = options;
      this.getDataPayload();
    },

    // ajax get to retrieve data
    getDataPayload: function getDataPayload() {
      var _this = this;

      $.get(this.options.endpoint, function (data) {
        _this.configureData(data);
      });
    },

    // method to model our raw data payload
    // @param value [object] API payload returned via AJAX
    //
    configureData: function configureData(value) {
      // TODO: establish how we want to configure the data
      this.data = {
        next: value.next,
        previous: value.previous,
        glossary: value.results[0].analysis_type.glossary
      };
    },

    // hooks into Annotator lifecycle events
    //
    // TODOS:
    //  • how to create our own UI
    //  • how best to store our answers to interact with other plugins
    //  • how to pause the annotator lifecycle?
    beforeAnnotationCreated: function beforeAnnotationCreated(annotation) {
      var _this2 = this;

      return this.promiseHelper(annotation).then(function (value) {
        _this2.setUpCustomEditorPanel(value);
      });
    },

    setUpCustomEditorPanel: function setUpCustomEditorPanel(annotation) {
      console.log(annotation);
    },

    // helper promise function for intercepting Annotator UI
    //
    promiseHelper: function promiseHelper(annotation) {
      return new Promise(function (resolve, reject) {
        var value = annotation;
        resolve(value);
      });
    }

  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hbm5vdGF0b3ItY3VzdG9tLWVkaXRvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLFNBQVMscUJBQXFCLENBQUMsT0FBTyxFQUFDO0FBQ3JDLFNBQU87QUFDTCxTQUFLLEVBQUUsaUJBQVc7QUFDaEIsVUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDdkIsVUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0tBQ3ZCOzs7QUFHRCxrQkFBYyxFQUFFLDBCQUFVOzs7QUFDeEIsT0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxVQUFDLElBQUksRUFBSztBQUNyQyxjQUFLLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUMxQixDQUFDLENBQUE7S0FDSDs7Ozs7QUFLRCxpQkFBYSxFQUFFLHVCQUFTLEtBQUssRUFBQzs7QUFFNUIsVUFBSSxDQUFDLElBQUksR0FBRztBQUNWLFlBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtBQUNoQixnQkFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRO0FBQ3hCLGdCQUFRLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsUUFBUTtPQUNsRCxDQUFBO0tBQ0Y7Ozs7Ozs7O0FBUUQsMkJBQXVCLEVBQUUsaUNBQVMsVUFBVSxFQUFDOzs7QUFDM0MsYUFBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUNsQyxJQUFJLENBQUMsVUFBQyxLQUFLLEVBQUs7QUFDZixlQUFLLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO09BQ3BDLENBQUMsQ0FBQztLQUNOOztBQUVELDBCQUFzQixFQUFFLGdDQUFTLFVBQVUsRUFBRTtBQUMzQyxhQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ3pCOzs7O0FBSUQsaUJBQWEsRUFBRSx1QkFBUyxVQUFVLEVBQUU7QUFDbEMsYUFBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7QUFDdEMsWUFBSSxLQUFLLEdBQUcsVUFBVSxDQUFBO0FBQ3RCLGVBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUNoQixDQUFDLENBQUE7S0FDSDs7R0FFRixDQUFBO0NBQ0YiLCJmaWxlIjoic3JjL2Fubm90YXRvci1jdXN0b20tZWRpdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gYW5ub3RhdG9yQ3VzdG9tRWRpdG9yKG9wdGlvbnMpe1xuICByZXR1cm4ge1xuICAgIHN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICB0aGlzLmdldERhdGFQYXlsb2FkKCk7XG4gICAgfSxcblxuICAgIC8vIGFqYXggZ2V0IHRvIHJldHJpZXZlIGRhdGFcbiAgICBnZXREYXRhUGF5bG9hZDogZnVuY3Rpb24oKXtcbiAgICAgICQuZ2V0KHRoaXMub3B0aW9ucy5lbmRwb2ludCwgKGRhdGEpID0+IHtcbiAgICAgICAgdGhpcy5jb25maWd1cmVEYXRhKGRhdGEpO1xuICAgICAgfSlcbiAgICB9LFxuXG4gICAgLy8gbWV0aG9kIHRvIG1vZGVsIG91ciByYXcgZGF0YSBwYXlsb2FkXG4gICAgLy8gQHBhcmFtIHZhbHVlIFtvYmplY3RdIEFQSSBwYXlsb2FkIHJldHVybmVkIHZpYSBBSkFYXG4gICAgLy9cbiAgICBjb25maWd1cmVEYXRhOiBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAvLyBUT0RPOiBlc3RhYmxpc2ggaG93IHdlIHdhbnQgdG8gY29uZmlndXJlIHRoZSBkYXRhXG4gICAgICB0aGlzLmRhdGEgPSB7XG4gICAgICAgIG5leHQ6IHZhbHVlLm5leHQsXG4gICAgICAgIHByZXZpb3VzOiB2YWx1ZS5wcmV2aW91cyxcbiAgICAgICAgZ2xvc3Nhcnk6IHZhbHVlLnJlc3VsdHNbMF0uYW5hbHlzaXNfdHlwZS5nbG9zc2FyeVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBob29rcyBpbnRvIEFubm90YXRvciBsaWZlY3ljbGUgZXZlbnRzXG4gICAgLy9cbiAgICAvLyBUT0RPUzpcbiAgICAvLyAg4oCiIGhvdyB0byBjcmVhdGUgb3VyIG93biBVSVxuICAgIC8vICDigKIgaG93IGJlc3QgdG8gc3RvcmUgb3VyIGFuc3dlcnMgdG8gaW50ZXJhY3Qgd2l0aCBvdGhlciBwbHVnaW5zXG4gICAgLy8gIOKAoiBob3cgdG8gcGF1c2UgdGhlIGFubm90YXRvciBsaWZlY3ljbGU/XG4gICAgYmVmb3JlQW5ub3RhdGlvbkNyZWF0ZWQ6IGZ1bmN0aW9uKGFubm90YXRpb24pe1xuICAgICAgcmV0dXJuIHRoaXMucHJvbWlzZUhlbHBlcihhbm5vdGF0aW9uKVxuICAgICAgICAudGhlbigodmFsdWUpID0+IHtcbiAgICAgICAgICB0aGlzLnNldFVwQ3VzdG9tRWRpdG9yUGFuZWwodmFsdWUpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgc2V0VXBDdXN0b21FZGl0b3JQYW5lbDogZnVuY3Rpb24oYW5ub3RhdGlvbikge1xuICAgICAgY29uc29sZS5sb2coYW5ub3RhdGlvbik7XG4gICAgfSxcblxuICAgIC8vIGhlbHBlciBwcm9taXNlIGZ1bmN0aW9uIGZvciBpbnRlcmNlcHRpbmcgQW5ub3RhdG9yIFVJXG4gICAgLy9cbiAgICBwcm9taXNlSGVscGVyOiBmdW5jdGlvbihhbm5vdGF0aW9uKSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBsZXQgdmFsdWUgPSBhbm5vdGF0aW9uXG4gICAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgICAgfSlcbiAgICB9XG5cbiAgfVxufVxuIl19