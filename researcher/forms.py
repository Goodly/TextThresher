from django import forms

class UploadArticlesForm(forms.Form):
    article_archive_file = forms.FileField(allow_empty_file=False)

class UploadSchemaForm(forms.Form):
    schema_file = forms.FileField(allow_empty_file=False)
