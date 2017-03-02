from django import forms
from thresher.models import Project

class UploadArticlesForm(forms.Form):
    article_archive_file = forms.FileField(allow_empty_file=False)

class UploadSchemaForm(forms.Form):
    schema_file = forms.FileField(allow_empty_file=False)

class SelectProjectField(forms.ModelChoiceField):
    def label_from_instance(self, p):
        return p.name

help_select_project = "Select the Project for which you would like to generate tasks."
class SendTasksForm(forms.Form):
    project = SelectProjectField(Project.objects.all(),
                                 empty_label=None,
                                 help_text=help_select_project)
