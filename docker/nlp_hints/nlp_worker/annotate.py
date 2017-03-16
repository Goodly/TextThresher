import shlex
import tempfile
from subprocess32 import check_output, CalledProcessError
import rq
from redis import StrictRedis
import json

redis_conn = StrictRedis(host='django_rq', port=6379, db=0)
q = rq.Queue('nlp_importer', connection=redis_conn)

run_cmd = shlex.split('mvn -q exec:java -Dexec.mainClass="annotator.Annotator" -Dexec.args=in.json')

def nlp_hints(hint_source):
    with tempfile.NamedTemporaryFile(delete=True) as f:
        f.write(hint_source)
        f.flush()
        run_cmd[-1] = '-Dexec.args=%s' % f.name
        annotations = check_output(run_cmd, universal_newlines=True)
        # NLP-hints currently drops article_id from result records, so
        # convert source and dest from JSON so we can copy article_id over
        taskList = json.loads(hint_source)
        resultList = json.loads(annotations)
        for i in range(len(taskList)):
            resultList[i]['article_id'] = taskList[i].get('article_id', None)
        annotations = json.dumps(resultList)
        # send annotations back to Django for importing
        job = q.enqueue('data.nlp_importer.nlp_load', annotations,
                        timeout=60, result_ttl=24*3600)
        return annotations
