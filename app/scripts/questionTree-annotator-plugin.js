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
        editor = this.annotator.editor,
        that = this,
        topics = this.options.tuaData.topics;
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
        var $annotatorContent = $('.annotator-listing'),
            eventClass = $(e.target).attr('class');

        $annotatorContent.children().hide();
        $('.annotator-topics-list').remove();
        topics.forEach(function(topic){
          if(topic.name === eventClass) {
            topic.questions.forEach(function(question){
              if (question.top) {
                $annotatorContent.append(that.buildQuestionForm(question));

                $('.question').click(function(e){
                  console.log(e)
                })
              }
            });
          }
        });
      });

      annotator.editor.checkOrientation();
    });

    annotator.subscribe("annotationEditorHidden", function(){
      $('.annotator-listing').children().show();
      $('.remove').detach();
    });

  };

  QuestionTree.prototype.updateEditor = function(field, annotation) {
    // var text = typeof annotation.text != 'undefined' ? annotation.text : '';
    var topics = this.options.tuaData.topics,
        topicsPane = '<li class="annotator-topics-list">Topics</li><hr>';

    topics.forEach(function(item){
      topicsPane += '<li><a href="#" class="' + item.name + '">' + item.name + '</a></li>'
      // topicsPane += '<li>' + item.name + '</li>'
    });

    field.innerHTML = topicsPane;
  }

  QuestionTree.prototype.updateViewer = function(field, annotation) {
    var textDiv = $(field.parentNode).find('div:first-of-type')[0];
    textDiv.innerHTML = annotation.text;
    // $(textDiv).addClass('richText-annotation');
    $(field).remove(); //this is the auto create field by annotator and it is not necessary
  }

  QuestionTree.prototype.buildQuestionForm = function(question) {
    var form = '<ul class="remove"><form class="remove"><label>' + question.text + '</label>';
    switch (question.type) {
      case 'multiplechoice':
        question.answers.forEach(function(answer){
          form += '<li><input id="" type="radio" value=' + answer.id + '>' + answer.text + '</label></li>';
        })
      break;
    }
    form += '</form><a href="#" class="question button tiny">Next Question</a></ul>';
    return form;
  }

  return QuestionTree;

})(Annotator.Plugin);
