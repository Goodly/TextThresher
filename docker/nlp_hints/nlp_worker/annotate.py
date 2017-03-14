import shlex
import tempfile
from subprocess32 import check_output, CalledProcessError
run_cmd = shlex.split('mvn -q exec:java -Dexec.mainClass="annotator.Annotator" -Dexec.args=in.json')

def nlp_hints(hint_source):
    with tempfile.NamedTemporaryFile(delete=True) as f:
        f.write(hint_source)
        f.flush()
        run_cmd[-1] = '-Dexec.args=%s' % f.name
        annotations = check_output(run_cmd, universal_newlines=True)
        return annotations
