from django.conf import settings
from django import forms
from django.forms.widgets import (Select, SelectMultiple, HiddenInput,
                                  TextInput, Textarea)

from thresher.models import TASK_TYPE, Topic, Project, Contributor

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

class SelectContributorId(forms.ModelChoiceField):
    def label_from_instance(self, c):
        return c.__unicode__()

class NLPArticlesForm(forms.Form):
    starting_article_id = forms.IntegerField(min_value=0)
    ending_article_id = forms.IntegerField(min_value=0)


help_for_name = "The name of the project"
help_for_short_name = "Short name for project used in URLs"
help_for_desc = "What are these tasks for and how do they work?"
help_for_pybossa_url = "The URL of the Pybossa server to create the project on"
help_for_api_key = "API key for your account on this Pybossa server"
help_select_task_type = "Select the type of tasks you would like to generate."
help_select_topics = ("The selected topics will be used for task generation. <br>"
                      'Hold down "Control", or "Command" on a Mac, to select more than one.')
help_with_debug_server = ("The task presenter for this project will be retrieved from this server.<br>"
                          "Use 'npm run dev' server to debug task presenters.")
help_select_contributors = ("The contributors that you want to use the highlights of.")

class CreateProjectForm(forms.Form):
    error_css_class = 'error'
    required_css_class = 'required'

    task_type = SelectProjectType(TASK_TYPE,
                                  help_text=help_select_task_type)

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
                                  label="Description",
                                  max_length=8000,
                                  help_text=help_for_desc,
                                  widget=Textarea(
                                      attrs={"rows":3, "cols":60})
                                  )

    topics = SelectTopicsField(Topic.objects.filter(parent=None).order_by("name"),
                               help_text=help_select_topics,
                               widget=SelectMultiple(attrs={"size":11}))

    starting_article_id = forms.IntegerField(min_value=0)
    ending_article_id = forms.IntegerField(min_value=0)

    contributor_id = SelectContributorId(
                                Contributor.objects.order_by("id").all(),
                                label="Contributor",
                                help_text=help_select_contributors
    )

    # TODO: show min tokens only after Quiz is selected
    min_tokens_per_highlight = forms.IntegerField(min_value=0)
    max_tokens_per_highlight = forms.IntegerField(min_value=0)

    pybossa_url = forms.CharField(required=True,
                                  label="Pybossa server URL",
                                  initial="http://pybossa",
                                  max_length=1000,
                                  help_text=help_for_pybossa_url,
                                  widget=TextInput(attrs={"size":60}))

    pybossa_api_key = forms.CharField(required=True,
                                  label="Pybossa API key",
                                  max_length=36,
                                  help_text=help_for_api_key,
                                  widget=TextInput(attrs={"size":36}))

    debug_presenter = forms.BooleanField(required=False, initial=False,
                                         widget=HiddenInput)

    debug_server = forms.CharField(required=False,
                                   max_length=200,
                                   initial=settings.WEBPACK_DEV_SERVER,
                                   widget=HiddenInput)


class CreateProjectDebugForm(CreateProjectForm):
    debug_server = forms.CharField(required=False,
                                   label="URL serving task presenters",
                                   max_length=200,
                                   initial=settings.WEBPACK_DEV_SERVER,
                                   help_text=help_with_debug_server,
                                   widget=TextInput(attrs={"size":36}))


class EditProjectForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = ['name', 'short_name', 'description']
        label = {
            'name': "Project name",
            'short_name': "Short project name",
            'description': "Description"
        }
        widgets = {
            'name': TextInput(attrs={"size":60}),
            'short_name': TextInput(attrs={"size":30}),
            'description': Textarea(attrs={"rows":3, "cols":60})
        }
        help_text = {
            'name': help_for_name,
            'short_name': help_for_short_name,
            'description': help_for_desc
        }

    debug_presenter = forms.BooleanField(required=False, initial=False,
                                         widget=HiddenInput)

    debug_server = forms.CharField(required=False,
                                   max_length=200,
                                   initial=settings.WEBPACK_DEV_SERVER,
                                   widget=HiddenInput)


class EditProjectDebugForm(EditProjectForm):
    debug_server = forms.CharField(required=False,
                                   label="URL serving task presenters",
                                   max_length=200,
                                   initial=settings.WEBPACK_DEV_SERVER,
                                   help_text=help_with_debug_server,
                                   widget=TextInput(attrs={"size":36}))


class AddTasksForm(forms.Form):
    starting_article_id = forms.IntegerField(min_value=0)
    ending_article_id = forms.IntegerField(min_value=0)
    project_id = forms.IntegerField(required=True, widget=HiddenInput)
