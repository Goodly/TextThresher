from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

# Retrieve user model set by AUTH_USER_MODEL in settings.py
from django.contrib.auth import get_user_model
User = get_user_model()

from thresher.models import (UserProfile, Project, Article,
                             Topic, Question, Answer,
                             Contributor, Task,
                             ArticleHighlight, HighlightGroup,
                             QuizTaskRun, SubmittedAnswer,
                             NLPHints, ParserError)

class UserProfileInLine(admin.StackedInline):
    """ Class meant to serve as an inline in the
    newly defined user. An inline allows the
    UserProfile class to be modified directly
    through the User class, since an inline gets
    modified on the same page as its parent on the
    admin page. """

    model = UserProfile
    verbose_name_plural = 'user'

# Create a new User admin, adding the appropriate inline
class NewUserAdmin(UserAdmin):
    inlines = [
        UserProfileInLine,
    ]


def metadata_filename(obj):
    return obj.metadata.get('filename','-')
metadata_filename.short_description = 'Filename'


def getContributor(contributor):
    if contributor.username != "":
        return contributor.username
    else:
        return "pybossa_user_id: {}".format(contributor.pybossa_user_id)


def numberOfHighlights(obj):
    return len(obj.offsets)
numberOfHighlights.short_description = 'Number of Highlights'


class ProjectAdmin(admin.ModelAdmin):
    list_display = ('id',  'task_type', 'name', 'short_name',
                    'pybossa_url', 'pybossa_id', 'pybossa_created')


class ArticleAdmin(admin.ModelAdmin):
    list_display = ('id', 'article_number', metadata_filename)


class TopicAdmin(admin.ModelAdmin):
    def getParent(self, obj):
        if obj.parent:
            return obj.parent.name
        else:
            return "-"
    getParent.short_description = 'Parent'

    list_display = ('id', 'getParent', 'order', 'name')


class QuestionAdmin(admin.ModelAdmin):
    def topicName(self, obj):
        return obj.topic.name
    topicName.short_description = 'Topic'

    list_display = ('id', 'topic_id', 'topicName', 'question_type',
                    'hint_type', 'question_number', 'question_text')


class AnswerAdmin(admin.ModelAdmin):
    def getQuestionText(self, obj):
        return obj.question.question_text;
    getQuestionText.short_description = 'Question'

    list_display = ('id', 'question_id', 'getQuestionText',
                    'answer_number', 'answer_content')


class ContributorAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'pybossa_user_id')


class TaskAdmin(admin.ModelAdmin):
    def getProjectName(self, obj):
        return obj.project.name
    getProjectName.short_description = 'Project Name'

    list_display = ('id', 'task_type', 'getProjectName', 'pybossa_created',
                    'pybossa_id', 'pybossa_state')


class ArticleHighlightAdmin(admin.ModelAdmin):
    def getContributor(self, obj):
        return getContributor(obj.contributor)
    getContributor.short_description = 'Contributor'

    def filename(self, obj):
        return metadata_filename(obj.article)
    filename.short_description = 'Filename'

    list_display = ('id', 'getContributor', 'contributor',
                    'article', 'filename')
    list_select_related = True


class HighlightGroupAdmin(admin.ModelAdmin):
    def topicName(self, obj):
        return obj.topic.name
    topicName.short_description = 'Topic'

    def getContributor(self, obj):
        return getContributor(obj.article_highlight.contributor)
    getContributor.short_description = 'Contributor'

    def filename(self, obj):
        return metadata_filename(obj.article_highlight.article)
    filename.short_description = 'Filename'

    list_display = ('id', 'article_highlight_id', 'getContributor',
                    'topic_id', 'topicName', 'case_number',
                    numberOfHighlights, 'filename')
    list_select_related = True


class QuizTaskRunAdmin(admin.ModelAdmin):
    def topicName(self, obj):
        return obj.highlight_group.topic.name
    topicName.short_description = 'Topic'

    def getContributor(self, obj):
        return getContributor(obj.contributor)
    getContributor.short_description = 'Contributor'

    def filename(self, obj):
        return metadata_filename(obj.highlight_group.article_highlight.article)
    filename.short_description = 'Filename'

    list_display = ('id', 'getContributor', 'highlight_group',
                    'topicName', 'article', 'filename')
    list_select_related = True


class SubmittedAnswerAdmin(admin.ModelAdmin):
    list_display = ('id', 'quiz_task_run', 'answer_id', 'answer_text',
                    numberOfHighlights)


class NLPHintsAdmin(admin.ModelAdmin):
    def numberOfHints(obj):
        return len(obj.offsets)
    numberOfHints.short_description = 'Number of hints'

    def filename(self, obj):
        return metadata_filename(obj.article)
    filename.short_description = 'Filename'

    list_display = ('id', 'hint_type', numberOfHints, 'filename')


# Re-register UserAdmin, including the additional attributes added
admin.site.unregister(User)
admin.site.register(User, NewUserAdmin)

admin.site.register(UserProfile)
admin.site.register(Project, ProjectAdmin)
admin.site.register(Article, ArticleAdmin)
admin.site.register(Topic, TopicAdmin)
admin.site.register(Question, QuestionAdmin)
admin.site.register(Answer, AnswerAdmin)
admin.site.register(Contributor, ContributorAdmin)
admin.site.register(Task, TaskAdmin)
admin.site.register(ArticleHighlight, ArticleHighlightAdmin)
admin.site.register(HighlightGroup, HighlightGroupAdmin)
admin.site.register(QuizTaskRun, QuizTaskRunAdmin)
admin.site.register(SubmittedAnswer, SubmittedAnswerAdmin)
admin.site.register(NLPHints, NLPHintsAdmin)
admin.site.register(ParserError)
