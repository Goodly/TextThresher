from django import forms
from django.forms.widgets import SelectMultiple, HiddenInput, TextInput

from thresher.models import TASK_TYPE, Topic

help_with_annotations = "Check this box to import any existing annotations and topics embedded in the articles."
class UploadArticlesForm(forms.Form):
    article_archive_file = forms.FileField(allow_empty_file=False)
    with_annotations = forms.BooleanField(required=False,
                                          label="Import annotations",
                                          help_text=help_with_annotations)

class UploadSchemaForm(forms.Form):
    schema_file = forms.FileField(allow_empty_file=False)

class SelectProjectType(forms.ChoiceField):
    def label_from_instance(self, p):
        return p.name

class SelectTopicsField(forms.ModelMultipleChoiceField):
    def label_from_instance(self, t):
        return t.name

class NLPArticlesForm(forms.Form):
    starting_article_id = forms.IntegerField(min_value=0)
    ending_article_id = forms.IntegerField(min_value=0)


help_for_name = "The name of the project"
help_for_short_name = "Short name for project"
help_for_desc = "What are these tasks for and how do they work?"
help_for_pybossa_url = "The URL of the Pybossa server to create the project on"
help_for_api_key = "API key for your account on this Pybossa server"
help_select_task_type = "Select the type of tasks you would like to generate."
help_select_topics = "The selected topics will be used for task generation."
help_with_debug_server = "The task presenter for this project will be retrieved from this server on each page load."
class CreateProjectForm(forms.Form):
    error_css_class = 'error'
    required_css_class = 'required'

    name = forms.CharField(required=True,
                           label="Project name",
                           max_length=200,
                           help_text=help_for_name,
                           widget=TextInput(attrs={"size":60}))

    short_name = forms.CharField(required=True,
                                 label="Short project name",
                                 max_length=100,
                                 help_text=help_for_short_name,
                                 widget=TextInput(attrs={"size":30}))

    description = forms.CharField(required=True,
                                  label="Long description",
                                  max_length=8000,
                                  help_text=help_for_desc,
                                  widget=forms.Textarea(attrs={"size":500}))

    task_type = SelectProjectType(TASK_TYPE,
                                  help_text=help_select_task_type)
    topics = SelectTopicsField(Topic.objects.filter(parent=None).order_by("name"),
                               help_text=help_select_topics,
                               widget=SelectMultiple(attrs={"size":11}))

    starting_article_id = forms.IntegerField(min_value=0)
    ending_article_id = forms.IntegerField(min_value=0)

    pybossa_url = forms.CharField(required=True,
                                  label="Pybossa server URL",
                                  initial="http://pybossa",
                                  max_length=1000,
                                  help_text=help_for_pybossa_url,
                                  widget=TextInput(attrs={"size":80}))

    pybossa_api_key = forms.CharField(required=True,
                                  label="Pybossa API key",
                                  max_length=36,
                                  help_text=help_for_api_key,
                                  widget=TextInput(attrs={"size":36}))

    debug_presenter = forms.BooleanField(required=False, initial=False,
                                         widget=HiddenInput)
    debug_server = forms.CharField(required=False,
                                   label="Debug presenter flag active",
                                   max_length=200,
                                   initial="http://localhost:3001",
                                   help_text=help_with_debug_server,
                                   widget=TextInput(attrs={"size":40}))
