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
    // console.log("QuestionTree-pluginInit");

    var me = this,
        annotator = this.annotator,
        editor = this.annotator.editor,
        topics = this.options.tuaData.topics,
        $widget = $('.annotator-widget'),
        // state is determined by whether or not we are showing topics
        // - or -
        // one or more questions e.g. ['1.1', '1.7']
        // we determine the state by looking at the questions or results array.
        // if empty state:
        //   show topics list.
        //   user selects topic,
        //   set _.last(state).questions = topic.questions
        // if nonempty state, look at _.last(state).questions
        // display all questions with top: true
        // if no top questions, look at what is left...

        state = [];

        // state = {
          // topics: true,
          // questions: [],
          // done: false,
          // results: []
        // }

        /*

        [ {}, {}, {} ]

        */

    //Check that annotator is working
    if (!Annotator.supported()) return;

    //Viewer setup
    // annotator.viewer.addField({
    //   load: this.updateViewer,
    // });

    // hides default annotation view
    // $(editor.element).find('textarea').remove();
    annotator.subscribe("annotationEditorShown", function(editor, annotation){
      $widget.children().hide();
      var topicsHTML = me.populateEditor(state, topics)
      $widget.append(topicsHTML);

      annotator.editor.checkOrientation();
      // will need this :
      // console.log(annotation)
      state.push({
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

    $widget.on('click', '.thresher-answer', function(e){
      var currentState = _.last(state),
          classes = $(e.target).attr('class').split(" ");
      if (classes.indexOf('thresher-answer') > -1) {
        // check if this topic has been interacted with / created -- if not, create one, otherwise add to it
        // if (!currentState.responses) {
          topics.forEach(function(topic) {
            if (slugify(topic.name) === classes[1]) {
              _.extend(_.last(state), {
                topicName: classes[1],
                responses: topic.questions
              })
            }
          })
        // } else {
          // currentState.responses.forEach(function(response) {

          // });
        // }
        $widget.children().hide();
        updatedHTML = me.populateEditor(state, topics);
        $widget.append(updatedHTML)
        // when you add a state by answering a question, remove the 'type' field to indicate that it's been answered
        // console.log("Current state:")
        // console.log(_.last(state))
      } else {
        console.log(e.target)
        // modify state – check if top level question
        if (_.any(_.last(state).responses, 'top')) {

          console.log('hey')
        }
        console.log($(e.target).val())
      }

    });



  };

  QuestionTree.prototype.populateEditor = function(state, topics) {
    // do we need to mark the form with an ID based on state?
    var editorHTML = '<form role="form" id="text-thresher-form"><ul class="list-unstyled">';
    if (!state.length) {
      editorHTML += '<label>Please choose a topic: </label>';
      topics.forEach(function(topic){
        // console.log(topic)
        // editorHTML += '<li class="list-group-item"><a href="#" class="thresher-answer ' + slugify(topic.name) + '">' + topic.name + '</a></li>';
        // editorHTML += '<option class="thresher-answer ' + slugify(topic.name) + '">' + topic.name + '</a></li>';
        editorHTML += '<li><button type="button" class="thresher-answer ' + slugify(topic.name) + ' btn btn-default">' + topic.name + '</button></li>';
      })
      editorHTML += '</ul>';
    } else {
      var responses = _.last(state).responses;
      // check if there are any top-level questions
      if (_.any(responses, 'top')) {
        _.filter(responses, 'top').forEach(function (response) {
          editorHTML += '<div class="form-group" id=question_"' + response.id + '"><label>' + response.text + '</label>';
          switch (response.type) {
            case 'multiplechoice':
              response.answers.forEach(function(answer){
                editorHTML += '<div class="radio thresher-answer"><label><input type="radio" class="thresher-response" name="optionsRadios" value=' + answer.id + '>' + answer.text + '</label></div>';
              })
            break;
          }
        })
        editorHTML += '</div>';
      } else {

      }
      // search for state where the only responses left are those with no dependencies and have no type field (indicating they've been answered)
      // must also record the answers given
      console.log(_.all(_.filter(responses, { 'dependencies': [] } ), { 'dependencies': [] } ) )
      console.log(_.all(responses, { 'dependencies': [] } ))

      // var topicName = _.last(state).topicName;
      // topics.forEach(function(topic){
      //   if (topicName === slugify(topic.name)) {
      //     topic.responses.forEach(function(question) {
      //       if (question.top) {
      //         editorHTML += '<li><a href="#" class="thresher-answer" id=question_"' + question.id + '">' + question.text + '</a></li>';
      //       }
      //     });
      //   }
      // })
    }
    editorHTML += '</form>';
    return editorHTML;

  }

  // a function that looks at the state, tells populateEditor what to make
  // a function that creates an HTML form with a button to click;
  // a function to store data in JSON
  // a global window listener, looks at state,
  // functions that listens to button clicks in the editor and acts appropriately

  QuestionTree.prototype.updateEditor = function(field, annotation) {
  // editor.fields[1].element.innerHTML = that.populateEditor(state, topics);
    // $(field).innerHTML = this.populateEditor(state, topics);

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

  // QuestionTree.prototype.buildQuestionForm = function(question) {
  //   var form = '<ul class="remove"><form id="text-thresher" class="remove"><label>' + question.text + '</label>';
  //   switch (question.type) {
  //     case 'multiplechoice':
  //       question.answers.forEach(function(answer){
  //         form += '<li><input class="radio" type="radio" value=' + answer.id + '>' + answer.text + '</label></li>';
  //       })
  //     break;
  //   }
  //   form += '</form><a href="#" class="button tiny" id="next-question">Next Question</a></ul>';
  //   return form;
  // }

  return QuestionTree;

})(Annotator.Plugin);
