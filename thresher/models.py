from django.db import models

# Articles containing text for analysis
class Article(models.Model):
    # unique id
    article_id = models.IntegerField(primary_key=True)

    # raw article text
    text = models.TextField()

    # metadata
    date_published = models.DateField(null=True)
    city_published = models.CharField(max_length=1000)
    state_published = models.CharField(max_length=2, null=True)
    periodical = models.CharField(max_length=1000)
    periodical_code = models.IntegerField()
    parse_version = models.CharField(max_length=5, null=True)
    annotators = models.CharField(max_length=1000) # as a JSON list

    def __unicode__(self):
        return "Article %d: %s, %s (%s)" % (
            self.article_id, self.city_published, self.state_published,
            self.periodical)

# Possible Analysis Types
class AnalysisType(models.Model):
    name = models.CharField(max_length=40, unique=True)
    requires_processing = models.BooleanField(default=False)
    instructions = models.TextField()
    glossary = models.TextField() # as a JSON map
    #topics = models.TextField() # as a big JSON blob.
    question_dependencies = models.TextField() # as a big JSON blob.

    def __unicode__(self):
        return "Analysis Type %s" % self.name

# A Text Unit of Analysis (TUA).
# TUAs have types and reference text within an article
class TUA(models.Model):
    # The type of the TUA
    analysis_type = models.ForeignKey(AnalysisType)

    # The referenced article
    article = models.ForeignKey(Article)

    # The relevant offsets in the article text.
    # Stored as a JSON list of (start, end) pairs.
    offsets = models.TextField()

    # A unique id for TUAs of this type in this article
    tua_id = models.IntegerField()

    # Have we answered questions about this TUA yet?
    is_processed = models.BooleanField(default=False)

    # A tua_id is unique per analysis_type per article
    class Meta:
        unique_together = ("tua_id", "analysis_type", "article")

    def __unicode__(self):
        return "TUA %d (type %s)" % (self.id, self.analysis_type.name)

# Possible topics for a given Analysis Type
class Topic(models.Model):
    # an id within the given Analysis Type
    topic_id = models.IntegerField() 

    # an id of its parent topic
    parent_id = models.ForeignKey(self, related_name="subtopics")

    # The name of the topic
    name = models.TextField()

    # Glossary related to the topic under analysis
    glossary = models.TextField()                 # as a JSON map

    instructions = models.TextField()

    
    class Meta:
        unique_together = ("topic_id", "analysis_type")

    def __unicode__(self):
        return "Topic %s in Analysis Type %s" % (self.name, self.analysis_type.name) 

# The question in a given topic
class QuestionUnderTopic(models.Model):
    # an id within the given topic
    question_id = models.OneToOneField(QuestionContent)

    # The topic this question belongs to
    topic_id = models.ForeignKey(Topic, related_name="related_questions")

    # The order of the question compared to other questions under the same topic
    order = models.IntegerField()
    
    class Meta:
        unique_together = ("question_id", "topic_id")

    def __unicode__(self):
        return "Question %d in Topic %s" % (self.question_id, self.topic_id.name)

# Question itself
class QuestionContent(models.Model):
    # The question id the content is related to
    question_id = models.IntegerField()

    # The type of question (e.g. multiple choice, text box, ...)
    # A list of all possible question types
    QUESTION_TYPE_CHOICES = (
            ('mc', 'Multiple Choice'),
            ('dt', 'Date Time'),
            ('tb', 'Textbox'),
            ('cl', 'Checklist')
    )
    type = models.CharField(max_length=2,
                            choices=QUESTION_TYPE_CHOICES)

    # The question text
    question_text = models.TextField()

    class Meta:
        unique_together = ("question_text", "type")

    def __unicode__(self):
        return "Question %d of type %s" % (self.question_text, self.type)

# Possible answers for a given question
# NOTE: This does NOT represent submitted answers, only possible answers
class Answer(models.Model):
    # an id within the given question
    answer_id = models.IntegerField()

    # The question to which this answer belongs
    question_id = models.OneToOneField(QuestionContent)
    
    # The text of the amswer
    answer_content = models.TextField()

    # The next question the answer is leading to
    next_question_id = models.OneToOneField(QuestionContent)

    class Meta:
        unique_together = ("answer_id", "question_id")

    def __unicode__(self):
        return "Answer %d for Question %d in Topic %s" % (self.answer_id, 
                                            self.question_id,
                                            self.question_id.topic_id.name)


# A submitted highlight group
class HighlightGroup(models.Model):
    # The tua being analyzed
    tua = models.ForeignKey(TUA)

    # The highlighted text (stored as JSON array of offset tuples)
    offsets = models.TextField()

    @property
    def questions(self):
        """
        A property to access all the submitted answers in this highlight group
        """
        # The CL answers
        cl_answers = list(CLSubmittedAnswer.objects.filter(highlight_group=self))
        # The MC answers
        mc_answers = list(MCSubmittedAnswer.objects.filter(highlight_group=self))
        # The TB answers
        tb_answers = list(TBSubmittedAnswer.objects.filter(highlight_group=self))
        # The dt answers
        dt_answers = list(DTSubmittedAnswer.objects.filter(highlight_group=self))
        
        return cl_answers + mc_answers + tb_answers + dt_answers

# A submitted answer to a question
# This is an abstract class which is subclassed to represent
# specifi types of answers (MC, CL, TB, ...)
class SubmittedAnswer(models.Model):
    # The highlight group this answer is part of
    highlight_group = models.ForeignKey(HighlightGroup)

    # The id of the user who submitted this answer
    user_id = models.IntegerField()

    class Meta:
        abstract = True

 
# A submitted answer for a Multiple Choice question
class MCSubmittedAnswer(SubmittedAnswer):
    # The question this answer is for
    question = models.ForeignKey(Question, limit_choices_to={"type":"mc"})

    # The answer chosen
    answer = models.ForeignKey(Answer)

# A submitted answer for a Checklist question
class CLSubmittedAnswer(SubmittedAnswer):
    # The question this answer is for
    question = models.ForeignKey(Question, limit_choices_to={"type":"cl"})

    # For a checklist, each submission could include multiple answers 
    # Answers are re-used across submissions
    # Therefore we need a many to many relationship
    answer = models.ManyToManyField(Answer)

# A submitted higlight group for a Textbox question
class TBSubmittedAnswer(SubmittedAnswer):
    # The question this answer is for
    question = models.ForeignKey(Question, limit_choices_to={"type":"tb"})

    # The text of the answer
    answer = models.TextField()

# A submitted answer for a Date Time question
class DTSubmittedAnswer(SubmittedAnswer):
    # The question this answer is for
    question = models.ForeignKey(Question, limit_choices_to={"type":"dt"})

    # The submitted date time answer
    answer = models.DateTimeField()
    
