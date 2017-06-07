from django import forms
from django.forms.widgets import SelectMultiple, HiddenInput, TextInput

from thresher.models import Project, Topic

help_with_annotations = "Check this box to import any existing annotations and topics embedded in the articles."
class UploadArticlesForm(forms.Form):
    article_archive_file = forms.FileField(allow_empty_file=False)
    with_annotations = forms.BooleanField(required=False,
                                          label="Import annotations",
                                          help_text=help_with_annotations)

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
help_with_nlp = "Checking this box will generate NLP hints instead of generating tasks. Potentially time consuming."
help_with_debug_server = "The task presenter for this project will be retrieved from this server on each page load."
class SendTasksForm(forms.Form):
    project = SelectProjectField(Project.objects.all().order_by("name"),
                                 empty_label=None,
                                 help_text=help_select_project)
    topics = SelectTopicsField(Topic.objects.filter(parent=None).order_by("name"),
                               help_text=help_select_topics,
                               widget=SelectMultiple(attrs={"size":11}))
    starting_article_id = forms.IntegerField(min_value=0)
    ending_article_id = forms.IntegerField(min_value=0)
    add_nlp_hints = forms.BooleanField(required=False,
                                       label="Begin NLP processing",
                                       help_text=help_with_nlp)
    debug_presenter = forms.BooleanField(required=False, initial=False, widget=HiddenInput)
    debug_server = forms.CharField(required=False,
                                   label="Debug presenter flag active",
                                   max_length=200,
                                   initial="http://localhost:3001",
                                   help_text=help_with_debug_server,
                                   widget=TextInput(attrs={"size":40}))
