import logging
logger = logging.getLogger(__name__)
import tarfile, tempfile
import django_rq
from data.load_data import load_schema_atomic

@django_rq.job('file_importer', timeout=60, result_ttl=24*3600)
def import_schema(uploaded_filename, schema_contents, owner_profile_id):
    logger.info("Received %d schema file bytes" % len(schema_contents))
    with tempfile.NamedTemporaryFile(delete=True) as schema_file:
        schema_file.write(schema_contents)
        schema_file.flush()
        schema_id = load_schema_atomic(uploaded_filename, schema_file.name)
        return schema_id
