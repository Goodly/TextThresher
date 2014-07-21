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

    var me = this,
        annotator = this.annotator,
        editor = this.annotator.editor,
        topics = this.options.tuaData.topics,
        $widget = $('.annotator-widget'),
        // state is determined by whether or not we are showing topics
        // - or -
        // one or more questions e.g. ['1.1', '1.7']
        state = {
          // topics: true,
          questions: [],
          done: false,
          results: []
        }

    //Check that annotator is working
    if (!Annotator.supported()) return;

    //Viewer setup
    // annotator.viewer.addField({
    //   load: this.updateViewer,
    // });

    // hides default annotation view
    // $(editor.element).find('textarea').remove();
    var counter = 0;
    annotator.subscribe("annotationEditorShown", function(editor, annotation){
      $widget.children().hide();
      var topicsHTML = me.editorState(state, topics)
      $widget.append(topicsHTML);

      annotator.editor.checkOrientation();
      console.log(annotation)
      state.results.push({
        annotation: {
          text: annotation.quote,
          startOffset: annotation.ranges[0].startOffset,
          endOffset: annotation.ranges[0].endOffset,
        }
      });
    });

    annotator.subscribe("annotationEditorHidden", function(){
      // $('.annotator-listing').children().show();
      // $('.remove').detach();
    });

    $widget.on('click', 'li', function(e){
      var classes = $(e.target).attr('class').split(" ");
      if (classes.indexOf('thresher-answer') > -1) {
        // get most-recently interacted with topic response object
        var selectedTopic = state.results[state.results.length - 1];
        state.results[0]['topicName'] = classes[1];
        console.log(selectedTopic)
        $widget.children().hide();
        updatedHTML = 'lol'
        me.editorState(state, topics)
        $widget.append(updatedHTML)
      } else {
        console.log(e)
      }

    })

  };

  QuestionTree.prototype.editorState = function(state, topics) {
    // do we need to mark the form with an ID based on state?
    var editorHTML = '<ul class=""><form id="text-thresher-form" class=""><label>Please choose a topic: </label>';
    if (!state.results.length) {
      topics.forEach(function(topic){
        // each link triggers a state change
        editorHTML += '<li><a href="#" class="thresher-answer ' + slugify(topic.name) + '">' + topic.name + '</a></li>';
      })
      editorHTML += '</form></ul>';
      // console.log(state)
    } else {
      console.log('in a question view')
    }
    return editorHTML;

  }

  // a function that looks at the state, tells editorState what to make
  // a function that creates an HTML form with a button to click;
  // a function to store data in JSON
  // a global window listener, looks at state,
  // functions that listens to button clicks in the editor and acts appropriately

  QuestionTree.prototype.updateEditor = function(field, annotation) {
  // editor.fields[1].element.innerHTML = that.editorState(state, topics);
    // $(field).innerHTML = this.editorState(state, topics);

    // var text = typeof annotation.text!='undefined'?annotation.text:'';
    // console.log($(field))

    // $(field).remove(); //this is the auto create field by annotator and it is not necessary

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
