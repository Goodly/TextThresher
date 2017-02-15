from django import forms

class UploadArticlesForm(forms.Form):
    name = forms.CharField(max_length=31)

    def save(self):
        return
