const options = {
  dataUrl: '../demo/tua.json',
  templates: {
    form: '/templates/form.handlebars',
    topic: '/templates/topic.handlebars',
    question: '/templates/question.handlebars',
    answer: '/templates/answer.handlebars'
  }
};

let firstRange = new Range({
  end: '/div[1]',
  endOffset: 24,
  start: '/div[1]',
  startOffset: 0
});

const annotationFixture = {
  quote: 'Santa Cruz city attorney',
  ranges: [firstRange]
};

describe('Annotator Custom Editor ', function() {
  let analyzer = annotatorContentAnalysis(options);
  analyzer.start();

  describe('On loading the module', () => {
    it('exists', () => expect(analyzer).to.exist);
  });

  describe('has the methods we want', () => {
    it('should set the data', () => {
      // TODO: create an annotation fixture, pass it into analyzer.beforeAnnotationCreated
      // doing so now causes the module to log the survey to the page
      // this is the first affirmation needed to decouple data presentation from data generation
      console.log('options.dataUrl', analyzer.beforeAnnotationCreated(annotationFixture));
    });

  });


});
