'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

Annotator.Plugin.CustomEditor = (function (_Annotator$Plugin) {
  function CustomEditor() {
    _classCallCheck(this, CustomEditor);

    if (_Annotator$Plugin != null) {
      _Annotator$Plugin.apply(this, arguments);
    }
  }

  _inherits(CustomEditor, _Annotator$Plugin);

  _createClass(CustomEditor, [{
    key: 'pluginInit',
    value: function pluginInit() {
      var _this = this;

      this.annotator.subscribe('beforeAnnotationCreated', function (annotation) {
        _this.customSetup(annotation);
      }).subscribe('annotationCreated', function (annotation) {
        _this.newCustomMethod(annotation);
      }).subscribe('annotationUpdated', function (annotation) {
        _this.newCustomMethod(annotation);
      }).subscribe('annotationDeleted', function (annotation) {
        _this.newCustomMethod(annotation);
      });
    }
  }, {
    key: 'customSetup',
    value: function customSetup(annotation) {
      console.log(annotation);
    }
  }, {
    key: 'newCustomMethod',
    value: function newCustomMethod(annotation) {
      console.log(annotation);
    }
  }]);

  return CustomEditor;
})(Annotator.Plugin);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hbm5vdGF0b3ItY3VzdG9tLWVkaXRvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWTtXQUFTLFlBQVk7MEJBQVosWUFBWTs7Ozs7OztZQUFaLFlBQVk7O2VBQVosWUFBWTs7V0FDdEMsc0JBQUU7OztBQUNWLFVBQUksQ0FBQyxTQUFTLENBQ1gsU0FBUyxDQUFDLHlCQUF5QixFQUFFLFVBQUEsVUFBVSxFQUFJO0FBQ2xELGNBQUssV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO09BQzlCLENBQUMsQ0FDRCxTQUFTLENBQUMsbUJBQW1CLEVBQUUsVUFBQSxVQUFVLEVBQUk7QUFDNUMsY0FBSyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7T0FDbEMsQ0FBQyxDQUNELFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxVQUFBLFVBQVUsRUFBSTtBQUM1QyxjQUFLLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQztPQUNsQyxDQUFDLENBQ0QsU0FBUyxDQUFDLG1CQUFtQixFQUFFLFVBQUEsVUFBVSxFQUFJO0FBQzVDLGNBQUssZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO09BQ2xDLENBQUMsQ0FBQTtLQUVMOzs7V0FFVSxxQkFBQyxVQUFVLEVBQUM7QUFDckIsYUFBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUN6Qjs7O1dBRWMseUJBQUMsVUFBVSxFQUFDO0FBQ3pCLGFBQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDekI7OztTQXhCbUMsWUFBWTtHQUFTLFNBQVMsQ0FBQyxNQUFNLENBMEIxRSxDQUFBIiwiZmlsZSI6InNyYy9hbm5vdGF0b3ItY3VzdG9tLWVkaXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIkFubm90YXRvci5QbHVnaW4uQ3VzdG9tRWRpdG9yID0gY2xhc3MgQ3VzdG9tRWRpdG9yIGV4dGVuZHMgQW5ub3RhdG9yLlBsdWdpbntcbiAgcGx1Z2luSW5pdCgpe1xuICAgIHRoaXMuYW5ub3RhdG9yXG4gICAgICAuc3Vic2NyaWJlKCdiZWZvcmVBbm5vdGF0aW9uQ3JlYXRlZCcsIGFubm90YXRpb24gPT4ge1xuICAgICAgICB0aGlzLmN1c3RvbVNldHVwKGFubm90YXRpb24pO1xuICAgICAgfSlcbiAgICAgIC5zdWJzY3JpYmUoJ2Fubm90YXRpb25DcmVhdGVkJywgYW5ub3RhdGlvbiA9PiB7XG4gICAgICAgIHRoaXMubmV3Q3VzdG9tTWV0aG9kKGFubm90YXRpb24pO1xuICAgICAgfSlcbiAgICAgIC5zdWJzY3JpYmUoJ2Fubm90YXRpb25VcGRhdGVkJywgYW5ub3RhdGlvbiA9PiB7XG4gICAgICAgIHRoaXMubmV3Q3VzdG9tTWV0aG9kKGFubm90YXRpb24pO1xuICAgICAgfSlcbiAgICAgIC5zdWJzY3JpYmUoJ2Fubm90YXRpb25EZWxldGVkJywgYW5ub3RhdGlvbiA9PiB7XG4gICAgICAgIHRoaXMubmV3Q3VzdG9tTWV0aG9kKGFubm90YXRpb24pO1xuICAgICAgfSlcblxuICB9XG5cbiAgY3VzdG9tU2V0dXAoYW5ub3RhdGlvbil7XG4gICAgY29uc29sZS5sb2coYW5ub3RhdGlvbik7XG4gIH1cblxuICBuZXdDdXN0b21NZXRob2QoYW5ub3RhdGlvbil7XG4gICAgY29uc29sZS5sb2coYW5ub3RhdGlvbik7XG4gIH1cblxufVxuIl19