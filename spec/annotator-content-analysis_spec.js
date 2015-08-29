const options = {
  dataUrl: '../demo/tua.json',
  templates: {
    form: '/templates/form.handlebars',
    topic: '/templates/topic.handlebars',
    question: '/templates/question.handlebars',
    answer: '/templates/answer.handlebars'
  }
};

const annotationFixture = {
  quote: 'Santa Cruz city attorney',
  ranges: [firstRange]
};

let firstRange = new Range({
  end: '/div[1]',
  endOffset: 24,
  start: '/div[1]',
  startOffset: 0
});

let analyzer = null;

describe('Annotator Custom Editor ', () => {
  beforeEach((done) => {
    analyzer = annotatorContentAnalysis(options);
    analyzer._elements();
    analyzer.createForm(options)
    .then(() =>{
      done();
    });
  });

  it('exists on load', () => {
    expect(analyzer).to.exist;
  });
});
