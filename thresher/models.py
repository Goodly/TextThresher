from django.db import models
from django.contrib.postgres.fields import JSONField
from django.core.exceptions import ValidationError
from requests.compat import urljoin, urlparse
from urlparse import urlunsplit
from django.urls import reverse

# Retrieve user model set by AUTH_USER_MODEL in settings.py
from django.contrib.auth import get_user_model
User = get_user_model()

from data.nlp_hint_types import HINT_TYPE_CHOICES


# Use OneToOneFields to add attributes to User
class UserProfile(models.Model):
    # Add link to User model
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # URLField uses django.core.validators.URLValidator
    # However, it requires a TLD, and won't accept a local hostname like
    # http://pybossa - such as provided by Docker's local virtual network
    # So fall back to a CharField
    pybossa_url = models.CharField(blank=True, max_length=200, default="")
    # UUID format is 36 chars including hyphens
    pybossa_api_key = models.CharField(blank=True, max_length=36, default="")

    def __unicode__(self):
        return "%s" % self.user.username


class Contributor(models.Model):
    pybossa_user_id = models.IntegerField(null=True, db_index=True, unique=True)
    experience_score = models.FloatField(default=0.0)
    accuracy_score = models.FloatField(default=0.0)

    def __unicode__(self):
        return "id {} pybossa user id {} experience score {} accuracy score {}".format(
                self.id,
                self.pybossa_user_id,
                self.experience_score,
                self.accuracy_score
        )


TASK_TYPE = (
    ('HLTR', 'Highlighter'),
    ('QUIZ', 'Quiz'),
)

class Project(models.Model):
    # currently owner_profile used to obtain default remote url and api key
    owner_profile = models.ForeignKey(UserProfile, related_name="projects",
                                      on_delete=models.PROTECT)
    pybossa_url = models.CharField(blank=True, max_length=200, default="")
    # UUID format is 36 chars including hyphens
    pybossa_api_key = models.CharField(blank=True, max_length=36, default="")

    # following fields used to configure remote project
    # max_length matches Pybossa db
    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=255)
    description = models.TextField()
    task_type = models.CharField(max_length=4,
                                 choices=TASK_TYPE, default="HLTR")
    task_config = JSONField(default={})
    pybossa_project_password = models.CharField(blank=True, max_length=36, default="")

    # following fields are obtained from Pybossa after project created on Pybossa
    pybossa_id = models.IntegerField(null=True)
    pybossa_owner_id = models.IntegerField(null=True)
    # UUID format is 36 chars including hyphens
    pybossa_secret_key = models.CharField(blank=True, max_length=36, default="")
    pybossa_created = models.DateTimeField(null=True)

    class Meta:
        unique_together = (
            ("name", "pybossa_url"),
            ("short_name", "pybossa_url"),
        )

    def __unicode__(self):
        return "id %d: %s" % (self.id, self.name)

    def get_local_edit_URL(self):
        """ Return a link to the local page to edit the project."""
        return reverse('researcher:edit_project', kwargs={"pk": self.id})

    def get_add_tasks_URL(self):
        """ Return a link to the local page to edit the project."""
        return reverse('researcher:add_project_tasks', kwargs={"pk": self.id})

    def join_remote_base_URL(self, urlpath):
        if self.pybossa_url is None:
            return ""
        # If the URL is reachable only from inside Docker, rewrite it for devs
        if urlparse(self.pybossa_url).netloc.lower() == "pybossa":
            return urljoin("http://localhost:3002", urlpath)
        else:
            return urljoin(self.pybossa_url, urlpath)

    def get_remote_project_settings_URL(self):
        """ Return a link to the remote Pybossa project if it has been created."""
        return self.join_remote_base_URL("project/%s/settings" % (self.short_name))

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
        return "id %d task type: %s pybossa_id: %d" % (self.id, self.task_type, self.pybossa_id)

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
    metadata = JSONField(default={}) # as a JSON map

    def __unicode__(self):
        return "id %d: numbered %d" % (
            self.id, self.article_number)


# Topics that are either parents of leaf topics, or leaf topics with questions.
class Topic(models.Model):
    # an id of its parent topic
    parent = models.ForeignKey("self", related_name="subtopics",
                               on_delete=models.PROTECT, null=True)

    # The name of the topic
    name = models.TextField()

    # The order of a leaf-topic
    order = models.IntegerField(null=True)

    # Glossary related to the topic under analysis
    glossary = JSONField(default={}) # as a JSON map

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
            ('TEXT', 'Text'),
            ('DATE', 'Date'),
            ('TIME', 'Time'),
    )
    question_type = models.CharField(max_length=10,
                                     choices=QUESTION_TYPE_CHOICES)

    hint_type = models.CharField(max_length=10,
                                 choices=HINT_TYPE_CHOICES,
                                 default='NONE')

    # just like [Answer]next_questions, used for questions without choices
    # such as text and dates. Could be used for 'if 01.02.any' as well.
    next_questions = JSONField(default=[])

    class Meta:
        unique_together = ("topic", "question_number")

    def __unicode__(self):
        return "id %d numbered %d type %s in topic %s" % (
            self.id, self.question_number, self.hint_type, self.topic.name)


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
    next_questions = JSONField(default=[])

    class Meta:
        unique_together = ("question", "answer_number")

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
                                related_name="highlight_taskruns",
                                on_delete=models.CASCADE)
    task = models.ForeignKey(Task,
                             null=True,
                             related_name="highlight_taskruns",
                             on_delete=models.CASCADE)
    # Allow null to avoid making changes to test data loader in data.load_data
    # Pybossa id of taskrun contributor
    contributor = models.ForeignKey(Contributor,
                                    null=True,
                                    related_name="highlight_taskruns",
                                    on_delete=models.CASCADE)
    # Taskrun id
    pybossa_id = models.IntegerField(null=True, db_index=True)
    # Complete taskrun as returned by Pybossa
    info = JSONField(null=True)

    topics_identified = models.ManyToManyField(
                        Topic,
                        through='HighlightGroup',
                        through_fields=('article_highlight', 'topic'))

    def __unicode__(self):
        desc = ("id %d for article id %d" % (self.id, self.article.id))
        if self.pybossa_id:
            desc += " pybossa taskrun id %d" % self.pybossa_id
        if self.contributor:
            desc += " by Pybossa user %d" % self.contributor.pybossa_user_id
        return desc


# This is used to store HLTR taskruns retrieved from Pybossa
class HighlightGroup(models.Model):

    # The highlighted text (stored as JSON array of offset tuples)
    offsets = JSONField(default=[])

    # User assigned case number for this text
    case_number = models.IntegerField(db_index=True)

    # The topic of this text
    topic = models.ForeignKey(Topic, related_name="highlights",
                              on_delete=models.PROTECT, null=True)

    # The Article highlight object it belongs to
    article_highlight = models.ForeignKey(ArticleHighlight,
                                          related_name="highlights",
                                          on_delete=models.CASCADE)

    def __unicode__(self):
        if self.topic:
            topic_name = self.topic.name
        else:
            topic_name = "NLP"
        desc = (("id %d article id %d Topic %s and Case %d ") %
                (self.id, self.article_highlight.article.id,
                topic_name, self.case_number))
        if self.article_highlight.contributor:
            desc += " by Pybossa user %d" % self.article_highlight.contributor.pybossa_user_id
        return desc


class QuizTaskRun(models.Model):
    article = models.ForeignKey(Article,
                                related_name="quiz_taskruns",
                                on_delete=models.CASCADE,
                                null=True)   # nullable for makemigration

    # The highlight group this Quiz addressed
    highlight_group = models.ForeignKey(HighlightGroup,
                                        related_name="submitted_answers",
                                        on_delete=models.CASCADE,
                                        null=True)   # nullable for makemigration

    task = models.ForeignKey(Task,
                             related_name="quiz_taskruns",
                             on_delete=models.CASCADE)

    # Pybossa id of taskrun contributor
    contributor = models.ForeignKey(Contributor,
                                    related_name="quiz_taskruns",
                                    on_delete=models.CASCADE)

    # Taskrun id
    pybossa_id = models.IntegerField(null=True, db_index=True)

    # Complete taskrun as returned by Pybossa
    info = JSONField()

    def __unicode__(self):
        desc = ("id %d" % (self.id,))
        if self.pybossa_id:
            desc += " pybossa taskrun id %d" % self.pybossa_id
        if self.contributor:
            desc += " by Pybossa user %d" % self.contributor.pybossa_user_id
        return desc


# A submitted answer to a question
class SubmittedAnswer(models.Model):
    quiz_task_run = models.ForeignKey(QuizTaskRun,
                             related_name="submitted_answers",
                             on_delete=models.CASCADE)

    # db_constraint=False because currently the front end dynamically
    # generates the subtopic question and answers, and has to use
    # negative ids to avoid collision with database keys
    # So currently expecting to load negative ids without
    # related records for some submitted answers.
    answer = models.ForeignKey(Answer,
                               related_name="submitted_answers",
                               null=True,
                               db_constraint=False,
                               on_delete=models.CASCADE)

    answer_text = models.TextField(default="")

    # highlighted text (stored as JSON array of offset tuples)
    offsets = JSONField(default=[])

    def __unicode__(self):
        return ("id %d question id %d pybossa user id %d") % (self.id,
                self.question.id, self.quiz.pybossa_user_id)


class NLPHints(models.Model):
    article = models.ForeignKey(Article,
                                related_name="hints",
                                on_delete=models.CASCADE)
    hint_type = models.CharField(max_length=10,
                                 choices=HINT_TYPE_CHOICES)
    # The highlighted text (stored as JSON array of offset tuples)
    offsets = JSONField(default=[])

    class Meta:
        unique_together = ("article", "hint_type")
        verbose_name = "NLP hint"
        verbose_name_plural = "NLP hints"

    def __unicode__(self):
        return ("id %d article id %d hint type %s") % (self.id,
                self.article_id, self.hint_type)
