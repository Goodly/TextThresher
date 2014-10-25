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
    requires_processing = models.BooleanField()
    instructions = models.TextField()
    glossary = models.TextField() # as a JSON map
    topics = models.TextField() # as a big JSON blob.
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
    tua_id = models.IntegerField(max_length=10)

    # Have we answered questions about this TUA yet?
    is_processed = models.BooleanField(default=False)

    # A tua_id is unique per analysis_type per article
    class Meta:
        unique_together = ("tua_id", "analysis_type", "article")

    def __unicode__(self):
        return "TUA %d (type %s)" % (self.id, self.analysis_type.name)

# Possible topics for a given Analysis Type
class Topic(models.Model):
    # The analysis type to which this topic belongs
    analysis_type = models.ForeignKey(AnalysisType)

    # The name of the topic
    name = models.TextField()

# The question in a given topic
class Question(models.Model):
    # The topic this question belongs to
    topic = models.ForeignKey(Topic)
    
    # The type of question (e.g. multiple choice, text box, ...)
    # A list of all possible question types
    QUESTION_TYPE_CHOICES = (
            ('MC', 'Multiple Choice'),
            ('DT', 'Date Time'),
            ('TB', 'Textbox'),
            ('CL', 'Checklist')
    )
    question_type = models.CharField(max_length=2,
                                     choices=QUESTION_TYPE_CHOICES)

    # The question text
    text = models.TextField()
    
# Possible answers for a given question
# NOTE: This does NOT represent submitted answers, only possible answers
class Answer(models.Model):
    # The question to which this answer belongs
    question = models.ForeignKey(Question)
    
    # The text of the amswer
    text = models.TextField()

# A submitted highlight group
# A highlight group contains the higlighted words and the answer
# This is an abstract class to be subclassed for different types of questions
class HighlightGroup(models.Model):
    # The tua being analyzed
    tua = models.ForeignKey(TUA)

    # The question being answered
    question = models.ForeignKey(Question)

    # The higlighted text (stored as JSON array of offset tuples)
    highlighted_text = models.TextField()

    class Meta:
        abstract = True


# A submitted highlight group for a Multiple Choice question
class MCHighlightGroup(HighlightGroup):
     # The answer chosen
     answer = models.ForeignKey(Answer)

# A submitted highlight group for a Checklist question
class CLHighlightGroup(HighlightGroup):
     # For a checklist, each submission could include multiple answers 
     # Answers are re-used across submissions
     # Therefore we need a many to many relationship
     answer = models.ManyToManyField(Answer)

# A submitted higlight group for a Textbox question
class TBHighlightGroup(HighlightGroup):
    # The text of the answer
    answer = models.TextField()

# A submitted highlight group for a Date Time question
class DTHighlightGroup(HighlightGroup):
    # The submitted date time answer
    answer = models.DateTimeField()

