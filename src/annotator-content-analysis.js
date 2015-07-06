function annotatorContentAnalysis(options){
  return {
    start() {
      this.options = options;
      this._elements();
      this.getTemplates();
      this.getData();
    },

    _elements() {
      this.survey = {
        answers: [],
        topics: [],
        questions: []
      }
    },

    getTemplates() {
      this.templates = {}
      $.each(this.options.templates, (key, value, index) => {
        let template = this.getUrl(value);
        template.then((res) => {
          this.templates[key] = res;
        })
      });
    },

    // GET data via AJAX or pass along data object
    //
    getData(){
      if (!!this.options.data) {
        this.setData(this.options.data);
      } else {
        let data = this.getUrl(this.options.dataUrl);
        data.then((res) => {
          this.setData(res)
        });
      }
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

    // returns a promise that isn't resolved until our survey is submitted
    //
    createSurvey(annotation) {
      return new Promise((resolve, reject) => {
        this.data.analysis_type.topics.forEach((element) => {
          this.getTopics(element)
        });
        let data = {
          thisTopics: this.survey.topics.join('')
        }

        let formTemplate = Handlebars.compile(this.templates.form)

        $('body').append(formTemplate(data))

        $('.submit').on('click', (e) => {
          console.log($('form').serialize())
          resolve(annotation)
          return false

        })

        $('.next-question').on('click', e => {
          $('.survey-unit__question').each((idx, question) => {
            const selectedAnswer = $(question).find('.survey-unit__answer:checked')[0];
            if (selectedAnswer) {
              console.log('selected answer dependency: ', selectedAnswer.dataset.dependency);
            }
          });
          return false;
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
    },

    // this function runs once the promise in this.beforeAnnotationCreated() has been resolved
    postResults(annotation) {
      console.log('postResults');
    },

    // ANNOTATOR LIFECYCLE EVENTS
    //
    beforeAnnotationCreated(annotation){
      return this.createSurvey(annotation)
        .then((annotation) => {
          return this.postResults(annotation);
        });
    },

    annotationCreated(annotation) {
      return annotation
   }

  }
}
