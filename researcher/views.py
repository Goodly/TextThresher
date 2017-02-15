from django.shortcuts import render, get_object_or_404, redirect
from django.views import View

from researcher.forms import UploadArticlesForm

class UploadArticlesView(View):
    form_class = UploadArticlesForm
    template_name = 'researcher/upload_article_form.html'

    def get(self, request):
        return render(
            request,
            self.template_name,
            {'form': self.form_class()}
        )
