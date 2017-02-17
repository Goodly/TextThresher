from django import forms

class UploadArticlesForm(forms.Form):
    article_archive_file = forms.FileField(allow_empty_file=False)

    def save(self):
        return
