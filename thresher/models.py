from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import JSONField
from django.core.exceptions import ValidationError
from requests.compat import urljoin, urlparse
from urlparse import urlunsplit
from django.urls import reverse

# User doing the annotating - uses OneToOneFields to add attributes to django.contrib.auth.User
class UserProfile(models.Model):
    # Add link to default User model
    user = models.OneToOneField(User)

    # Metadata
    experience_score = models.DecimalField(max_digits=5, decimal_places=3)
    accuracy_score = models.DecimalField(max_digits=5, decimal_places=3)
    # URLField uses django.core.validators.URLValidator
    # However, it requires a TLD, and won't accept a local hostname like
    # http://pybossa - such as provided by Docker's local virtual network
    # So fall back to a CharField
    pybossa_url = models.CharField(blank=True, max_length=200, default="")
    # UUID format is 36 chars including hyphens
    pybossa_api_key = models.CharField(blank=True, max_length=36, default="")

    def __unicode__(self):
        return "%s" % self.user.username

TASK_TYPE = (
    ('HLTR', 'Highlighter'),
    ('QUIZ', 'Quiz'),
)

class Project(models.Model):
    # max_length matches Pybossa db
    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=255)
    instructions = models.TextField()
    task_type = models.CharField(max_length=4,
                                 choices=TASK_TYPE, default="HLTR")
    # following fields are null unless remote Pybossa project has been created
    pybossa_url = models.URLField(blank=True, default="")
    pybossa_id = models.IntegerField(null=True)
    pybossa_owner_id = models.IntegerField(null=True)
    # UUID format is 36 chars including hyphens
    pybossa_secret_key = models.CharField(blank=True, max_length=36, default="")
    pybossa_created = models.DateTimeField(null=True)

    def __unicode__(self):
        return "id %d: %s" % (self.id, self.name)

    def join_remote_base_URL(self, urlpath):
        if self.pybossa_url is None:
            return ""
        # If the URL is reachable only from inside Docker, rewrite it for devs
        if urlparse(self.pybossa_url).netloc.lower() == "pybossa":
            return urljoin("http://localhost:3002", urlpath)
        else:
            return urljoin(self.pybossa_url, urlpath)

    def get_remote_URL(self):
        """ Return a link to the remote Pybossa project if it has been created."""
        return self.join_remote_base_URL("project/%s/" % (self.short_name))

    def get_local_task_retrieval_URL(self):
        """ Return a link to the local page to start retrieval of task runs."""
        return reverse('researcher:retrieve_taskruns', kwargs={"pk": self.id})

    def get_remote_delete_URL(self):
        """ Return a link to the remote page to delete the remote project."""
        return self.join_remote_base_URL("project/%s/delete" % (self.short_name))

    def get_local_remote_delete_URL(self):
        """ Return a link to the local page to delete the remote project."""
        return reverse('researcher:remote_project_delete', kwargs={"pk": self.id})

class Task(models.Model):
    """
    These task records are created to record successful exports to Pybossa
    so will always have Pybossa id available
    """
    project = models.ForeignKey(Project, related_name="tasks",
                                on_delete=models.CASCADE)
    task_type = models.CharField(max_length=4) # 'HLTR' or 'QUIZ'
    # Copy of complete task as sent to Pybossa
    info = JSONField()
    pybossa_id = models.IntegerField()
    pybossa_project_id = models.IntegerField()
    pybossa_created = models.DateTimeField()
    pybossa_state = models.CharField(max_length=16) # 'ongoing' or 'completed'

    def __unicode__(self):
        return "id %d task type: %s pybossa_id: %d" % (self.id, self.task_type, self.pybossa_project_id)

    def get_remote_URL(self):
        if task.project.pybossa_url:
            return urljoin(task.project.pybossa_url, "task/%d/" % (self.pybossa_id))
        else:
            return ""

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

    def getTopicTree(self):
        """ returns the topic with all levels of its subtopic tree """
        topicQuery = Topic.objects.raw("""
            WITH RECURSIVE subtopic(id, parent_id, name, "order",
                                    glossary, instructions)
            AS (
                SELECT id, parent_id, name, "order",
                       glossary, instructions
                FROM thresher_topic WHERE id=%s
              UNION ALL
                SELECT t.id, t.parent_id, t.name, t.order,
                       t.glossary, t.instructions
                FROM subtopic, thresher_topic t
                WHERE t.parent_id = subtopic.id
            )
            SELECT id, parent_id, name, "order", glossary, instructions
            FROM subtopic ORDER BY "order" LIMIT 500;
        """, [self.id])
        # Force query to execute and generate Topic models array
        return topicQuery[:]


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

    # The text of the answer
    answer_content = models.TextField()

    # Contingent questions as an array of question IDs
    next_questions = models.TextField(default="[]")

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
# This is used to store HLTR taskruns retrieved from Pybossa
class ArticleHighlight(models.Model):
    article = models.ForeignKey(Article,
                                related_name="users_highlights",
                                on_delete=models.CASCADE)
    task = models.ForeignKey(Task,
                             null=True,
                             related_name="users_highlights",
                             on_delete=models.SET_NULL)
    # Source of the highlight
    HIGHLIGHT_SOURCE_CHOICES = (
        ('HLTR', 'Highlighter'),
        ('QUIZ', 'Quiz'),
    )
    highlight_source = models.CharField(choices=HIGHLIGHT_SOURCE_CHOICES,
                                                max_length=4)
    # Allow null to avoid making changes to test data loader in data.load_data
    # Pybossa id of taskrun contributor
    pybossa_user_id = models.IntegerField(null=True)
    # Taskrun id
    pybossa_id = models.IntegerField(null=True, db_index=True)
    # Complete taskrun as returned by Pybossa
    info = JSONField(null=True)

    topics_identified = models.ManyToManyField(
                        Topic,
                        through='HighlightGroup',
                        through_fields=('article_highlight', 'topic'))

    def __unicode__(self):
        return ("id %d for article id %d by Pybossa user %d" %
                (self.id, self.article.id, self.pybossa_user_id))


# This is used to store HLTR taskruns retrieved from Pybossa
class HighlightGroup(models.Model):

    # The highlighted text (stored as JSON array of offset tuples)
    offsets = models.TextField()

    # Highlighted text
    highlight_text = models.TextField()

    # User assigned case number for this text
    case_number = models.IntegerField(db_index=True)

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
        if self.topic:
            topic_name = self.topic.name
        else:
            topic_name = "NLP"
        return ("id %d article id %d "
                "Topic %s and Case %d "
                "created by %d") % (self.id,
                 self.article_highlight.article.id,
                 topic_name, self.case_number,
                 self.article_highlight.pybossa_user_id)


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


class NLPHints(models.Model):
    article = models.ForeignKey(Article,
                                related_name="hints",
                                on_delete=models.CASCADE)
    question = models.ForeignKey(Question,
                                 related_name="hints",
                                 on_delete=models.CASCADE)
    # The highlighted text (stored as JSON array of offset tuples)
    highlight_text = models.TextField()
    # The highlighted text (stored as JSON array of offset tuples)
    offsets = models.TextField()

    def __unicode__(self):
        return ("id %d article id %d question id %d") % (self.id,
                self.article_id, self.question_id)
