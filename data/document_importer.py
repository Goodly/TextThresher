import logging
logger = logging.getLogger(__name__)
import tarfile, os, fnmatch
from tarfile import TarError

import django_rq
from django.db import transaction

from thresher.models import UserProfile
from data.load_data import load_article_atomic, parse_batch_name


def import_archive(orig_filename, filename, owner_profile_id, with_annotations=False):
    try:
        batch_name = parse_batch_name(orig_filename)
        with tarfile.open(filename) as tar:
            members = [ af for af in tar.getmembers()
                            if af.isfile() and fnmatch.fnmatch(af.name, "*.txt")]
            logger.info("articles found %d" % len(members))
            for member in members:
                raw_bytes = tar.extractfile(member).read()
                article_filename = os.path.basename(member.name)
                import_article.delay(batch_name, raw_bytes, article_filename,
                                     owner_profile_id, with_annotations)
    finally:
        os.remove(filename)

@django_rq.job('file_importer', timeout=60, result_ttl=24*3600)
def import_article(batch_name, raw_bytes, filename, owner_profile_id, with_annotations):
    owner_profile = UserProfile.objects.get(pk=owner_profile_id)
    load_article_atomic(batch_name, raw_bytes, filename, with_annotations)
