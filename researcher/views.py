from django.shortcuts import render, get_object_or_404, redirect
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin

from researcher.forms import UploadArticlesForm

class UploadArticlesView(LoginRequiredMixin, View):
    form_class = UploadArticlesForm
    template_name = 'researcher/upload_article_form.html'
    login_url = '/admin/login/'
    redirect_field_name = 'next'

    def get(self, request):
        return render(
            request,
            self.template_name,
            {'form': self.form_class()}
        )
