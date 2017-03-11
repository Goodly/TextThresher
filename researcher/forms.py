from django import forms
from django.forms.widgets import SelectMultiple

from thresher.models import Project, Topic

class UploadArticlesForm(forms.Form):
    article_archive_file = forms.FileField(allow_empty_file=False)

class UploadSchemaForm(forms.Form):
    schema_file = forms.FileField(allow_empty_file=False)

class SelectProjectField(forms.ModelChoiceField):
    def label_from_instance(self, p):
        return p.name

class SelectTopicsField(forms.ModelMultipleChoiceField):
    def label_from_instance(self, t):
        return t.name

help_select_project = "Select the Project for which you would like to generate tasks."
help_select_topics = "The selected topics will be used for task generation."
class SendTasksForm(forms.Form):
    project = SelectProjectField(Project.objects.all().order_by("name"),
                                 empty_label=None,
                                 help_text=help_select_project)
    topics = SelectTopicsField(Topic.objects.filter(parent=None).order_by("name"),
                               help_text=help_select_topics,
                               widget=SelectMultiple(attrs={"size":11}))
    starting_article_id = forms.IntegerField(min_value=0)
    ending_article_id = forms.IntegerField(min_value=0)
