from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

# User doing the annotating - uses OneToOneFields to add attributes to django.contrib.auth.User
class UserProfile(models.Model):
    # Add link to default User model
    user = models.OneToOneField(User)

    # Metadata
    experience_score = models.DecimalField(max_digits=5, decimal_places=3)
    accuracy_score = models.DecimalField(max_digits=5, decimal_places=3)

    def __unicode__(self):
        return "User %s" % self.user

class Client(models.Model):
    name = models.CharField(max_length=100)
    topic = models.ForeignKey("Topic", on_delete=models.CASCADE, 
                              related_name="clients")
    def __unicode__(self):
        return "Client %s" % username

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

# Topics that are either parents of leaf topics, or leaf topics with questions.
class Topic(models.Model):
    # an id of its parent topic
    parent = models.ForeignKey("self", related_name="subtopics",
                               on_delete=models.CASCADE, null=True)

    # The name of the topic
    name = models.TextField()

    # The order of a leaf-topic
    order = models.IntegerField(null=True)

    # Glossary related to the topic under analysis
    glossary = models.TextField() # as a JSON map

    instructions = models.TextField()

    def validate_unique(self, exclude=None):
        qs = Topic.objects.filter(name=self.name)
        if qs.filter(parent=self.parent).exists() and self.id != qs[0].id:
            raise ValidationError('Subtopics need to be unique.')

    def save(self, *args, **kwargs):
        self.validate_unique()
        super(Topic, self).save(*args, **kwargs)

    class Meta:
        unique_together = ("parent", "order", "name")

    def __unicode__(self):
        if self.parent:
            return "Topic %s in Parent %s" % (self.name, self.parent.name)
        return "Topic %s (no parent)" % (self.name)

# Question
class Question(models.Model):
    # The question id the content is related to
    question_id = models.IntegerField()

    # The topic this question belongs to
    topic = models.ForeignKey(Topic, related_name="related_questions", 
                              on_delete=models.CASCADE)

    # The question text
    question_text = models.TextField()

    # Whether the question is a contingency one or not
    contingency = models.BooleanField()

    # The default next question (for mandatory questions)
    default_next = models.ForeignKey('self', related_name="next_default", 
                                     on_delete=models.CASCADE, null=True)

    class Meta:
        unique_together = ("topic", "question_text")

    def __unicode__(self):
        return "Question %d of type %s in topic %s" % (
            self.question_id, self.topic.name)

# Possible answers for a given question
# NOTE: This does NOT represent submitted answers, only possible answers
class Answer(models.Model):
    # an id within the given question
    answer_id = models.IntegerField()

    # The question to which this answer belongs
    question = models.ForeignKey(Question, related_name="answers")
    
    # The text of the amswer
    answer_content = models.TextField()

    # The next question the answer is leading to
    next_question = models.ForeignKey(Question, related_name="next_question", 
                                      null=True)
    class Meta:
        unique_together = ("answer_id", "question")

    def __unicode__(self):
        return ("Answer %d for Question %s " 
                "in Topic %s") % (self.answer_id, self.question.question_text, 
                                  self.question.topic.name)

# A submitted highlight group
class HighlightGroup(models.Model):

    # The highlighted text (stored as JSON array of offset tuples)
    offsets = models.TextField()

    @property
    def questions(self):
        """
        A property to access all the submitted answers in this highlight group
        """
        answers = list(SubmittedAnswer.objects.filter(highlight_group=self))
        return answers

# A container class for an Article and its Highlight Group
# that will be referenced by a topic
class ArticleHighlight(models.Model):
    topic = models.ForeignKey(Topic, related_name="article_highlight",
                              on_delete=models.CASCADE)
    highlight = models.OneToOneField(HighlightGroup)
    article = models.ForeignKey(Article, related_name="highlight_groups", on_delete=models.CASCADE)

    def __unicode__(self):
        return ("Highlights %s in Article %d") % (self.highlight.offsets, 
                                                  self.article.article_id)

# A submitted answer to a question
class SubmittedAnswer(models.Model):
    # The highlight group this answer is part of
    highlight_group = models.ForeignKey(HighlightGroup, related_name="submitted_answer")
    question = models.ForeignKey(Question)
    user_submitted = models.ForeignKey(UserProfile, related_name="submitted_answer")
    answer = models.TextField()
 
