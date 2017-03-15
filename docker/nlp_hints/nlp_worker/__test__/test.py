import time
from rq import Queue
from redis import StrictRedis

# Tell RQ what Redis connection to use
redis_conn = StrictRedis(host='django_rq', port=6379, db=0)
q = Queue('nlp_exporter', connection=redis_conn)

# Request annotation from NLP worker
with open('in.json') as f:
    source = f.read()
    job = q.enqueue('nlp_worker.annotate.nlp_hints', source,
                    timeout=600, result_ttl=24*3600)

print "Waiting for job: ", job.id
while not job.result:
    print ".",
    time.sleep(1)
print
print job.result
