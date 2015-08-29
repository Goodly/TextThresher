function annotatorContentAnalysis(options){
  return {
    // ANNOTATOR LIFECYCLE EVENTS
    //
    start() {
      this._elements();
      this.createForm(options);
    },

    beforeAnnotationCreated(annotation){
      return this.appendSurveyToDom(annotation)
        .then((annotation) => {
          return annotation
        });
    },

    annotationCreated(annotation) {
      console.log(annotation); // #TODO: remove once we don't need this log
      return annotation
   },

    annotationEditorHidden(editor) {
      this.$el.empty() //#REVIEW why is this not firing when I hide the editor?
    },

   // MODULE EVENTS
   //
    _elements() {
      this.survey = {
        answers: [],
        topics: [],
        questions: []
      }
      this.templates = {}
    },

    createForm(options){
      return this.getTemplates(options.templates)
        .then((results) => {
          results.forEach((element, index) => {
            this.templates[element.key] = element.value;
          })
          return this.getData(options)
            .then(() => {
              return this.setSurvey()
          });
      });
    },

    // Returns templates block as promise which resolves when all are loaded
    //
    getTemplates(templates) {
      return Promise.all(this.mapObjectToArray(templates, (arg, key) => {
        return this.getUrl(arg, key)
          .then((value) => {
            return {key: key, value: value}
        });
      }))
    },

    mapObjectToArray(obj, cb) {
      let res = []
      for (var key in obj)
        res.push(cb(obj[key], key));
      return res;
    },

    // GET data via AJAX or pass along data object
    //
    getData(){
      return new Promise((resolve, reject) => {
        if (!!options.data) {
          this.setData(options.data);
          resolve()
        } else {
          let data = this.getUrl(options.dataUrl);
          data.then((res) => {
            this.setData(res)
            resolve()
          });
        }
      })
    },

    // shortcut for AJAX get
    getUrl(url) {
      return $.get(url, (data) => {
        return data;
      });
    },

    // #TODO: make this more universal
    //
    // method to cast our data payload into module's context
    // @param value [object] API payload returned via AJAX
    //
    setData(value){
      this.data = {
        next: value.next,
        previous: value.previous,
        analysis_type: value.results[0].analysis_type
      }
    },

    setSurvey() {
      this.data.analysis_type.topics.forEach((element) => {
        this.getTopics(element)
      });

      this.data.compiled = {
        thisTopics: this.survey.topics.join('')
      };

      this.formTemplate = Handlebars.compile(this.templates.form);

      $('body').append('<div class="survey"></div>');

      this.$el = $('.survey');
    },

    // append our formTemplate into the DOM
    // promise is resolved on click of Submit button
    //
    appendSurveyToDom(annotation) {
      return new Promise((resolve, reject) => {

        this.$el.html(this.formTemplate(this.data.compiled))

        $('.submit').on('click', (e) => {
          annotation.aca = $('form').serialize()
          resolve(annotation)
          this.$el.empty()
          return false
        })

        $('.next-question').on('click', e => {
          $('.survey-unit__question').each((idx, question) => {
            const selectedAnswer = $(question).find('.survey-unit__answer:checked')[0];
            if (selectedAnswer) {
              console.log('selected answer dependency: ', selectedAnswer.dataset.dependency);
            }
          });
        })

      })
    },

    getTopics(element) {
      const topicId = element.topic_id;
      element.questions.forEach((element) => {
        this.getQuestions(element, topicId)
      });
      let data = {
        element,
        thisQuestions: this.survey.questions.join('')
      }
      this.survey.questions = []
      let topicTemplate = Handlebars.compile(this.templates.topic);

      this.survey.topics.push(topicTemplate(data))
    },

    getQuestions(element, topicId) {
      const dependencyId = `${topicId}.${element.question_id}`;
      this.parentId = element.id
      element.answers.forEach((element) => {
        this.getAnswers(element, dependencyId);
      });
      let data = {
        element,
        thisAnswers: this.survey.answers.join('')
      }
      this.survey.answers = []
      let questionTemplate = Handlebars.compile(this.templates.question);
      this.survey.questions.push(questionTemplate(data))
    },

    getAnswers(element, dependencyId) {
      const dependencies = this.data['analysis_type']['question_dependencies'];
      const dependencyKey = `${dependencyId}.${element.answer_id}`;
      const dependentQuestionId = dependencies[dependencyKey] || dependencies[`${dependencyId}.any`];

      let data = {
        element,
        dependentQuestionId,
        parentId: this.parentId,
      }
      let answerTemplate = Handlebars.compile(this.templates.answer);

      this.survey.answers.push(answerTemplate(data))
    }

  }
}
