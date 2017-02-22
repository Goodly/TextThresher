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
    pybossa_url = models.URLField(blank=True, default="")
    # UUID format is 36 chars including hyphens
    pybossa_api_key = models.CharField(blank=True, max_length=36, default="")

    def __unicode__(self):
        return "%s" % self.user.username


class Project(models.Model):
    # max_length from Pybossa db
    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=255)
    instructions = models.TextField()

    def __unicode__(self):
        return "id %d: %s" % (self.id, self.name)


# Articles containing text for analysis
class Article(models.Model):
    # A number assigned by researcher. Not the autofield.
    article_number = models.IntegerField(null=True)

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
        return "id %d: numbered %d, %s, %s (%s)" % (
            self.id, self.article_number, self.city_published,
            self.state_published, self.periodical)


# Topics that are either parents of leaf topics, or leaf topics with questions.
class Topic(models.Model):
    # an id of its parent topic
    parent = models.ForeignKey("self", related_name="subtopics",
                               on_delete=models.SET_NULL, null=True)

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
        unique_together = ("parent", "name")

    def __unicode__(self):
        if self.parent:
            return "id %d %s in Parent %s" % (self.id,
                    self.name, self.parent.name)
        return "id %d %s (no parent)" % (self.id, self.name)


# Question
class Question(models.Model):
    # The question number the content is related to
    question_number = models.IntegerField()

    # The topic this question belongs to
    topic = models.ForeignKey(Topic, related_name="questions",
                              on_delete=models.CASCADE)

    # The question text
    question_text = models.TextField()

    # Question type
    QUESTION_TYPE_CHOICES = (
            ('RADIO', 'Single answer - radio buttons'),
            ('CHECKBOX', 'Multiple answer - checkboxes'),
            ('DATETIME', 'Date and Time'),
            ('DATE', 'Date only'),
            ('TIME', 'Time only'),
            ('TEXT', 'Text'),
    )
    question_type = models.CharField(max_length=10,
                                     choices=QUESTION_TYPE_CHOICES)

    # Whether the question is a contingency one or not
    contingency = models.BooleanField(default=False)

    # The default next question (for mandatory questions)
    default_next = models.ForeignKey("self",
                                     related_name="next_default",
                                     on_delete=models.SET_NULL, null=True)

    class Meta:
        unique_together = ("topic", "question_text")

    def __unicode__(self):
        return "id %d numbered %d type %s in topic %s" % (
            self.id, self.question_number, self.question_type, self.topic.name)


# Possible answers for a given question
# NOTE: This does NOT represent submitted answers, only possible answers
class Answer(models.Model):
    # A number within the given question
    answer_number = models.IntegerField()

    # The question to which this answer belongs
    question = models.ForeignKey(Question,
                                 related_name="answers",
                                 on_delete=models.CASCADE, null=True)

    # The text of the amswer
    answer_content = models.TextField()

    # The next question the answer is leading to
    next_question = models.ForeignKey(Question,
                                      related_name="question_next",
                                      on_delete=models.SET_NULL, null=True)
    class Meta:
        unique_together = ("answer_number", "question")

    def __unicode__(self):
        return ("id %d numbered %d Answer %s for Question %s "
                "in Topic %s") % (self.id, self.answer_number,
                                  self.answer_content,
                                  self.question.question_text,
                                  self.question.topic.name)


# A container class for an Article and its Highlight Group
# that will be referenced by a topic
class ArticleHighlight(models.Model):
    article = models.ForeignKey(Article,
                                related_name="users_highlights",
                                on_delete=models.CASCADE)
    created_by = models.ForeignKey(UserProfile, related_name="users_highlights",
                                   on_delete=models.CASCADE)

    # Source of the highlight
    HIGHLIGHT_SOURCE_CHOICES = (
        ('HLTR', 'Highlighter'),
        ('QUIZ', 'Quiz'),
    )
    highlight_source = models.CharField(choices=HIGHLIGHT_SOURCE_CHOICES,
                                                max_length=4)

    topics_identified = models.ManyToManyField(
                        Topic,
                        through='HighlightGroup',
                        through_fields=('article_highlight', 'topic'))

    def __unicode__(self):
        return ("id %d for article id %d "
                "by %s") % (self.id, self.article.id,
                self.created_by.user.username)


# A submitted highlight group
class HighlightGroup(models.Model):

    # The highlighted text (stored as JSON array of offset tuples)
    offsets = models.TextField()

    # Highlighted text
    highlight_text = models.TextField()

    # User assigned case number for this text
    case_number = models.IntegerField()

    # The topic of this text
    topic = models.ForeignKey(Topic, related_name="highlights",
                              on_delete=models.PROTECT, null=True)

    # The Article highlight object it belongs to
    article_highlight = models.ForeignKey(ArticleHighlight,
                                          related_name="highlights",
                                          on_delete=models.CASCADE)

    @property
    def questions(self):
        """
        A property to access all the submitted answers in this highlight group
        """
        answers = list(SubmittedAnswer.objects.filter(highlight_group=self))
        return answers

    def __unicode__(self):
        return ("id %d article id %d "
                "Topic %s and Case %d "
                "created by %s") % (self.id,
                 self.article_highlight.article.id,
                 self.topic.name, self.case_number,
                 self.article_highlight.created_by.user.username)


# A submitted answer to a question
class SubmittedAnswer(models.Model):
    # The highlight group this answer is part of
    highlight_group = models.ForeignKey(HighlightGroup,
                                        related_name="submitted_answers",
                                        on_delete=models.CASCADE)

    question = models.ForeignKey(Question,
                                 related_name="submitted_answers",
                                 on_delete=models.CASCADE)

    user_submitted = models.ForeignKey(UserProfile,
                                       related_name="submitted_answers",
                                       on_delete=models.CASCADE)
    answer = models.TextField()

    def __unicode__(self):
        return ("id %d question id %d user %s") % (self.id,
                question.id, self.user_submitted.user.username)
