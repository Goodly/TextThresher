import logging
logger = logging.getLogger(__name__)
import tarfile, os, fnmatch
from tarfile import TarError

import django_rq
from thresher.models import UserProfile
from data.load_data import load_article, load_annotations
from data.parse_document import parse_article

def import_archive(filename, owner_profile_id, with_annotations=False):
    try:
        with tarfile.open(filename) as tar:
            members = [ af for af in tar.getmembers()
                            if af.isfile() and fnmatch.fnmatch(af.name, "*.txt")]
            logger.info("articles found %d" % len(members))
            for member in members:
                article = tar.extractfile(member).read()
                import_article.delay(article, member.name, owner_profile_id, with_annotations)
    finally:
        os.remove(filename)

@django_rq.job('file_importer', timeout=60, result_ttl=24*3600)
def import_article(article, filename, owner_profile_id, with_annotations):
    owner_profile = UserProfile.objects.get(pk=owner_profile_id)
    annotated_article = parse_article(article, filename)
    article_obj = load_article(annotated_article)
    if article_obj and with_annotations:
        load_annotations(annotated_article, article_obj)
    return article_obj.id
