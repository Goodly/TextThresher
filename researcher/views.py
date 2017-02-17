import logging
logger = logging.getLogger(__name__)
import tarfile, tempfile, os, fnmatch

from django.shortcuts import render, get_object_or_404, redirect
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin

from researcher.forms import UploadArticlesForm
from data.load_data import load_article
from data.parse_document import parse_article

def import_article(filename, owner_profile):
    logger.info("is tar file: %s" % tarfile.is_tarfile(filename))
    with tarfile.open(filename) as tar:
        members = [ af for af in tar.getmembers()
                        if af.isfile() and fnmatch.fnmatch(af.name, "*.txt")]
        logger.info("articles found %d" % len(members))
        for member in members:
            article = tar.extractfile(member).read()
            load_article(parse_article(article, member.name), owner_profile)

class UploadArticlesView(PermissionRequiredMixin, View):
    form_class = UploadArticlesForm
    template_name = 'researcher/upload_article_form.html'
    login_url = '/admin/login/'
    redirect_field_name = 'next'
    permission_required = u'thresher.add_article'

    def get(self, request):
        return render(
            request,
            self.template_name,
            {'form': self.form_class()}
        )

    def post(self, request):
        bound_form = self.form_class(request.POST, request.FILES)
        if bound_form.is_valid():
            f = request.FILES['article_archive_file']
            logger.info("Request to import article archive %s, length %d" % (f.name, f.size))
            with tempfile.NamedTemporaryFile() as archive_file:
                for chunk in f.chunks():
                    archive_file.write(chunk)
                archive_file.flush()
                logger.info("Archive copied to temp file %s" % archive_file.name)
                import_article(archive_file.name, request.user.userprofile)

            return redirect('/admin/thresher/article/')
        else:
            return render(
                request,
                self.template_name,
                {'form': bound_form}
            )
