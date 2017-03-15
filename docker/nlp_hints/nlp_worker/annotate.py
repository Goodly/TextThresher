import shlex
import tempfile
from subprocess32 import check_output, CalledProcessError
from rq import Queue
from redis import StrictRedis

redis_conn = StrictRedis(host='django_rq', port=6379, db=0)
q = Queue('nlp_importer', connection=redis_conn)

run_cmd = shlex.split('mvn -q exec:java -Dexec.mainClass="annotator.Annotator" -Dexec.args=in.json')

def nlp_hints(hint_source):
    with tempfile.NamedTemporaryFile(delete=True) as f:
        f.write(hint_source)
        f.flush()
        run_cmd[-1] = '-Dexec.args=%s' % f.name
        annotations = check_output(run_cmd, universal_newlines=True)
        # send annotations back to Django for importing
        job = q.enqueue('data.nlp_importer.nlp_load', annotations,
                        timeout=60, result_ttl=24*3600)
        return annotations
