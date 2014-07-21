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
        topics = this.options.tuaData.topics,
        // state is determined by whether or not we are showing topics
        // - or -
        // one or more questions e.g. ['1.1', '1.7']
        state = {
          // topics: true,
          questions: [],
          done: false,
          answers: []
        };

    //Check that annotator is working
    if (!Annotator.supported()) return;


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
      editor.fields[1].element.innerHTML = that.editorState(state, topics);
      annotator.editor.checkOrientation();
    });

    annotator.subscribe("annotationEditorHidden", function(){
      // $('.annotator-listing').children().show();
      // $('.remove').detach();
    });

  };

  QuestionTree.prototype.editorState = function(state, topics) {
    // console.log(element)
    // do we need to mark the form with an ID based on state?
    var editorHTML = '<ul class=""><form id="text-thresher-form" class=""><label>hey</label>';
    if (!state.answers.length) {
      topics.forEach(function(topic){
        // each one of these is a link that needs to trigger a state change
        editorHTML += '<li><a href="#" class="' + topic.name + '">' + topic.name + '</a></li>';
      })
      editorHTML += '<a href="#" class="button tiny" id="next-question">Next Question</a></form></ul>';

    }
    return editorHTML;

  }

  QuestionTree.prototype.populateTopics = function(data) {
    // console.log(data)
    topicsPane = '<li class="annotator-topics-list">Topics</li><hr>';

    data.forEach(function(item){
      topicsPane += '<li><a href="#" class="' + item.name + '">' + item.name + '</a></li>'
      // topicsPane += '<li>' + item.name + '</li>'
    });

    return topicsPane;
  }

  // a function that looks at the state, tells editorState what to make
  // a function that creates an HTML form with a button to click;
  // a function to store data in JSON
  // a global window listener, looks at state,
  // functions that listens to button clicks in the editor and acts appropriately

  QuestionTree.prototype.updateEditor = function(field, annotation) {
    // var text = typeof annotation.text != 'undefined' ? annotation.text : '';
    // var topics = this.options.tuaData.topics,

    // field.innerHTML = topicsPane;
  }

  QuestionTree.prototype.updateViewer = function(field, annotation) {
    var textDiv = $(field.parentNode).find('div:first-of-type')[0];
    textDiv.innerHTML = annotation.text;
    // $(textDiv).addClass('richText-annotation');
    $(field).remove(); //this is the auto create field by annotator and it is not necessary
  }

  QuestionTree.prototype.buildQuestionForm = function(question) {
    var form = '<ul class="remove"><form id="text-thresher" class="remove"><label>' + question.text + '</label>';
    switch (question.type) {
      case 'multiplechoice':
        question.answers.forEach(function(answer){
          form += '<li><input class="radio" type="radio" value=' + answer.id + '>' + answer.text + '</label></li>';
        })
      break;
    }
    form += '</form><a href="#" class="button tiny" id="next-question">Next Question</a></ul>';
    return form;
  }

  return QuestionTree;

})(Annotator.Plugin);
