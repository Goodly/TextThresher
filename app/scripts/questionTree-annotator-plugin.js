/*
Question Tree Annotator Plugin
Copyright (C) 2014 Zachary Zibrat / Deciding Force
License TODO: https://github.com/palimpsests

Logic inspired by source code from Rich Text Annotator Plugin v1.0 (https://github.com/danielcebrian/richText-annotator)
*/

var _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Annotator.Plugin.QuestionTree = (function(_super) {
  __extends(QuestionTree, _super);

  function QuestionTree(element,options) {
    _ref = QuestionTree.__super__.constructor.apply(this, arguments);
    return _ref;
  };

  QuestionTree.prototype.pluginInit = function() {
    console.log("QuestionTree-pluginInit");

    var annotator = this.annotator,
        editor = this.annotator.editor;
    //Check that annotator is working
    if (!Annotator.supported()) {
      return;
    }

    annotator.editor.addField({
      type: 'input',
      load: this.updateEditor,
      options: this.options
    });

    //Viewer setup
    annotator.viewer.addField({
      load: this.updateViewer,
    });

    // hides default annotation view
    $(editor.element).find('textarea').remove();

    annotator.subscribe("annotationEditorShown", function(editor, annotation){
      $('.annotator-listing li').click(function(e){
        $('.annotator-listing').empty()
      })
      annotator.editor.checkOrientation();
    });

    annotator.subscribe("annotationEditorHidden", function(){
    });

  };

  QuestionTree.prototype.updateEditor = function(field, annotation) {
    // var text = typeof annotation.text != 'undefined' ? annotation.text : '';
    var topics = this.options.tuaData.topics,
        topicsPane = '<li class="question-pane">Topics</li><hr>';

    topics.forEach(function(item){
      // topicsPane += '<li><a href="#" data-reveal-id="myModal">' + item.name + '</a></li>'
      topicsPane += '<li>' + item.name + '</li>'
    });

    field.innerHTML = topicsPane;
  }

  QuestionTree.prototype.updateViewer = function(field, annotation) {
    var textDiv = $(field.parentNode).find('div:first-of-type')[0];
    textDiv.innerHTML = annotation.text;
    // $(textDiv).addClass('richText-annotation');
    $(field).remove(); //this is the auto create field by annotator and it is not necessary
  }

  return QuestionTree;

})(Annotator.Plugin);
