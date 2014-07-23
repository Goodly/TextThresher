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
        state = [];

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
      if (!currentState.responses) {
        topics.forEach(function(topic) {
          if (slugify(topic.name) === classes[1]) {
            _.extend(_.last(state), {
              topicName: classes[1],
              responses: topic.questions
            })
          }
        })
        $widget.children().hide();
        updatedHTML = me.populateEditor(state, topics);
        $widget.append(updatedHTML)
      } else {
        var answeredQuestionId = $('.text-thresher-form').find('.question-container').last().attr('id');
            answerId = $('input:radio:checked:last').val();

        console.log('question answered:', answeredQuestionId)
        console.log('answer chosen: ', answerId)

        _.last(state).responses.forEach(function(response){
          if (response.id === answeredQuestionId) {
            console.log('question found')
            delete response.top;
            delete response.type;
            response.answers = _.filter(response.answers, {'id': answerId});
            if (response.dependencies.length) {
              console.log('question dependency')
              var dependency = _.filter(response.dependencies, {'if': answerId})[0];
              _.last(state)['activeQuestion'] = dependency['then'];
              delete response.dependencies;
            } else {
              delete response.top;
              delete response.type;
              delete response.dependencies;
              // delete _.last(state).activeQuestion;
            }
          }
        })

        $widget.children().hide();
        updatedHTML = me.populateEditor(state, topics);
        $widget.append(updatedHTML)
      }
      console.log("Current state:")
      console.log(_.last(state))

    });



  };

  QuestionTree.prototype.populateEditor = function(state, topics) {
    // do we need to mark the form with an ID based on state?
    var editorHTML = '<form role="form" class="text-thresher-form"><ul class="list-unstyled">',
        that = this;
    if (!state.length) {
      editorHTML += '<label>Please choose a topic: </label>';
      topics.forEach(function(topic){
        // console.log(topic)
        // editorHTML += '<li class="list-group-item"><a href="#" class="thresher-answer ' + slugify(topic.name) + '">' + topic.name + '</a></li>';
        // editorHTML += '<option class="thresher-answer ' + slugify(topic.name) + '">' + topic.name + '</a></li>';
        editorHTML += '<li><button type="button" class="thresher-answer ' + slugify(topic.name) + ' btn btn-primary">' + topic.name + '</button></li>';
      })
      editorHTML += '</ul>';
    } else {
      var responses = _.last(state).responses;
      // check if there are any top-level questions
      if (_.any(responses, 'top')) {
        _.filter(responses, 'top').forEach(function (response) {
          editorHTML += that.populateQuestionHTML(response);
          // editorHTML += '<div class="form-group question-container" id=' + response.id + '><label>' + response.text + '</label>';
          // switch (response.type) {
          //   case 'multiplechoice':
          //     response.answers.forEach(function(answer){
          //       editorHTML += '<div class="radio"><label><input type="radio" class="thresher-response" name="optionsRadios" value=' + answer.id + '>' + answer.text + '</label></div>';
          //     })
          //   break;
          // }
          // editorHTML += '</div>'
        })
        editorHTML += '<button type="button" class="thresher-answer btn btn-success">Submit</button>';
      } else {
        var questionId = _.last(state).activeQuestion,
            question = _.filter(responses, { 'id': questionId})[0];
        editorHTML += that.populateQuestionHTML(question);
        editorHTML += '<button type="button" class="thresher-answer btn btn-success">Submit</button>';
      }
      // search for state where the only responses left are those with no dependencies and have no type field (indicating they've been answered)
      // must also record the answers given
      // console.log(_.all(_.filter(responses, { 'dependencies': [] } ), { 'dependencies': [] } ) )
      // console.log(_.all(responses, { 'dependencies': [] } ))
    }
    editorHTML += '</form>';
    return editorHTML;

  }

  // a function that looks at the state, tells populateEditor what to make
  // a function that creates an HTML form with a button to click;
  // a function to store data in JSON
  // a global window listener, looks at state,
  // functions that listens to button clicks in the editor and acts appropriately
  QuestionTree.prototype.populateQuestionHTML = function(response) {
    var htmlString = '<div class="form-group question-container" id=' + response.id + '><label>' + response.text + '</label>';
    switch (response.type) {
      case 'multiplechoice':
        response.answers.forEach(function(answer){
          htmlString += '<div class="radio"><label><input type="radio" class="thresher-response" name="optionsRadios" value=' + answer.id + '>' + answer.text + '</label></div>';
        })
      break;
    }
    htmlString += '</div>'
    return htmlString;
  }


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

  return QuestionTree;

})(Annotator.Plugin);
