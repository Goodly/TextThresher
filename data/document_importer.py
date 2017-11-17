import logging
logger = logging.getLogger(__name__)
import tarfile, os, fnmatch
from tarfile import TarError

import django_rq
from django.db import transaction

from thresher.models import UserProfile
from data.load_data import load_article, load_annotations, parse_batch_name
from data.parse_document import parse_article

def import_archive(orig_filename, filename, owner_profile_id, with_annotations=False):
    try:
        batch_name = parse_batch_name(orig_filename)
        with tarfile.open(filename) as tar:
            members = [ af for af in tar.getmembers()
                            if af.isfile() and fnmatch.fnmatch(af.name, "*.txt")]
            logger.info("articles found %d" % len(members))
            for member in members:
                article = tar.extractfile(member).read()
                article_filename = os.path.basename(member.name)
                import_article.delay(batch_name, article, article_filename,
                                     owner_profile_id, with_annotations)
    finally:
        os.remove(filename)

@django_rq.job('file_importer', timeout=60, result_ttl=24*3600)
def import_article(batch_name, article, filename, owner_profile_id, with_annotations):
    owner_profile = UserProfile.objects.get(pk=owner_profile_id)
    with transaction.atomic():
        annotated_article = parse_article(article, filename)
        article_obj = load_article(annotated_article)
        article_obj.batch_name = batch_name
        article_obj.save()
        if article_obj and with_annotations:
            load_annotations(annotated_article, article_obj)
    return article_obj.id
