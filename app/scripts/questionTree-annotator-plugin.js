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

    var me = this,
        annotator = this.annotator,
        editor = this.annotator.editor,
        topics = this.options.tuaData.topics,
        destinationURL = this.options.destination,
        $widget = $('.annotator-widget'),
        states = [];

    //Check that annotator is working
    if (!Annotator.supported()) return;

    //Viewer setup
    // annotator.viewer.addField({
    //   load: this.updateViewer,
    // });

    // removes default annotation view
    // $(editor.element).find('textarea').remove();
    annotator.subscribe("annotationEditorShown", function(editor, annotation){
      console.log(topics[0].questions)
      $('#annotator-field-0').remove();
      if ($('.text-thresher-completion-form').length) {
        $('.text-thresher-completion-form').remove();
      }
      var topicsHTML = me.topicsList(topics);
      $widget.append(topicsHTML);

      annotator.editor.checkOrientation();
      // create a state object which will track the answers given
      states.push({
        annotation: {
          text: annotation.quote,
          startOffset: annotation.ranges[0].startOffset,
          endOffset: annotation.ranges[0].endOffset,
        }
      });
    });

    annotator.subscribe("annotationEditorHidden", function(){
      // $('.annotator-listing').children().show();
    });

    $widget.on('click', '.thresher-answer', function(e){
      // either the view state is topic list
      if (!_.last(states).topicId) {
        var topicClass = $(e.target).attr('class').split(" ");
        $.get('http://text-thresher.herokuapp.com/tasks')
          .success(function(data){
            JSON.parse(data).topics.forEach(function(topic){
              if (slugify(topic.name) === topicClass[1]) {
                _.extend(_.last(states), {
                  topicName: topicClass[1],
                  topicId: $(e.target).attr('id'),
                  questions: topic.questions,
                  top: true,
                  answers: [],
                });
              }
            })
            $('.state-element').remove();
            updatedHTML = me.populateEditor(states, topics);
            $widget.append(updatedHTML);
          })
      // or question/answer view
      } else {
        var answeredQuestionId = $('.text-thresher-form').find('.question-container').last().attr('id');
            answerId = $('input:radio:checked:last').val();
        _.last(states).answers.push({
          question: answeredQuestionId,
          answer: answerId,
        });
        _.last(states).top = false;
        _.last(states).questions.forEach(function(question){
          if (question.id === answeredQuestionId) {
            if (question.dependencies.length) {
              // if there are questions but no dependencies, we are done
              if ( !_.some(question.dependencies, {'if': answerId}) && !_.some(question.dependencies, {'if': answeredQuestionId }) ) {
                _.last(states)['done'] = true;
              } else {
                var dependency = _.filter(question.dependencies, {'if': answerId} )[0] || question.dependencies[0];
                _.last(states)['activeQuestion'] = dependency['then'];
              }
            } else {
              _.last(states)['done'] = true;
            }
            // we're done with this question, and remove its dependencies
            // this defines the 'complete' state : all question dependencies are empty arrays
            // question.dependencies = [];
            _.extend(question, {
              dependencies: [],
            });
          }
        })
        $('.state-element').remove();
        updatedHTML = me.populateEditor(states, topics);
        $widget.append(updatedHTML)
      }
      // console.log("All states: ")
      // console.log(states)
      console.log("Current state:")
      console.log(_.last(states))
    });

    $widget.on('click', '.thresher-submit', function(e){
      e.preventDefault();

    });

    $('.annotator-cancel').click(function(){
      $('.text-thresher-form').last().remove();
    });

    $('.annotator-save').click(function(){
      var payload = _.last(states);
      if (_.last(states).done) {
        $('th#' + payload.topicName).css('color', 'green');
        var column = $('th#' + payload.topicName).index() + 1;
        $('table tr td:nth-child(' + column + ')').css('color', 'green');
        console.alert("You are finished with topic " + payload.topicName + "!!")
      }

      $.ajax({
        url: destinationURL,
        method: 'POST',
        data: payload
      })

    })


  };

  QuestionTree.prototype.completionForm = function(states) {
    var editorHTML = '<form role="form" class="text-thresher-completion-form">';
    editorHTML += 'You are finished. <button class="btn btn-primary submit thresher-submit">Submit Answers</button>';
    editorHTML += '</form>';
    return editorHTML
  }

  QuestionTree.prototype.sendData = function(states, url) {
    console.log('making an AJAX request to the url!')
  }


  QuestionTree.prototype.topicsList = function(topics) {
    var editorHTML = '<div class="text-thresher-form"><ul class="list-unstyled state-element">';
    editorHTML += '<label>Please choose a topic: </label>';
    topics.forEach(function(topic){
      editorHTML += '<li><button type="button" class="thresher-answer ' + slugify(topic.name);
      editorHTML += ' btn btn-primary" + id=' + topic.id + '>' + topic.name + '</button></li>';
    })
    editorHTML += '</div>';
    return editorHTML;
  }

  QuestionTree.prototype.populateEditor = function(states, topics) {
    var editorHTML = '',
        that = this;
    if (_.last(states).done) {
      console.log('done')
      editorHTML += that.completionForm(states);
    } else {
      // var questions = _.last(states).questions;
      var questions = _.find(topics, { 'id': _.last(states).topicId }).questions;
      editorHTML += '<form role="form" class="text-thresher-form"><ul class="list-unstyled state-element">';
      // check if top-level question state
      if ( _.last(states).top ) {
        _.filter(questions, 'top').forEach(function (question) {
          editorHTML += that.populateQuestionHTML(question);
        })
        editorHTML += '<button type="button" class="thresher-answer btn btn-success">Next</button>';
      } else if ( _.last(states) ) {
        var questionId = _.last(states).activeQuestion,
            question = _.filter(questions, { 'id': questionId })[0];
        editorHTML += that.populateQuestionHTML(question);
        editorHTML += '<li><button type="button" class="thresher-answer btn btn-success">Submit</button></li>';
      }
      editorHTML += '</ul></form>';
    }
    return editorHTML;

  }

  // a function that looks at the states, tells populateEditor what to make
  // a function that creates an HTML form with a button to click;
  // a function to store data in JSON
  // a global window listener, looks at states,
  // functions that listens to button clicks in the editor and acts appropriately
  QuestionTree.prototype.populateQuestionHTML = function(question) {
    var htmlString = '<div class="form-group question-container" id=' + question.id + '><label>' + question.text + '</label>';
    switch (question.type) {
      case 'multiplechoice':
        question.answers.forEach(function(answer){
          htmlString += '<div class="radio"><label><input type="radio" class="thresher-question" name="optionsRadios" value=';
          htmlString += answer.id + '>' + answer.text + '</label></div>';
        })
      break;
    }
    htmlString += '</div>'
    return htmlString;
  }


  QuestionTree.prototype.updateEditor = function(field, annotation) {
  // editor.fields[1].element.innerHTML = that.populateEditor(states, topics);
    // $(field).innerHTML = this.populateEditor(states, topics);
    // var text = typeof annotation.text!='undefined'?annotation.text:'';
    // console.log($(field))

    // $(field).remove(); //this is the auto create field by annotator and it is not necessary
  }

  QuestionTree.prototype.updateViewer = function(field, annotation) {
    var textDiv = $(field.parentNode).find('div:first-of-type')[0];
    textDiv.innerHTML = annotation.text;
    // $(textDiv).addClass('richText-annotation');
    $(field).remove(); //this is the auto create field by annotator and it is not necessary
  }

  return QuestionTree;

})(Annotator.Plugin);
