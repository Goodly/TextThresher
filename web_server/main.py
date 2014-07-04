import json
import os
import urlparse
import uuid
import web

urls = (
    '/tasks', 'sampletask',
    '/tasks/submitted', 'submittedtask',
    '/tasks/reset', 'resettask',
)

SAMPLE_JSON_PATH = os.path.join(os.path.dirname(__file__), 'sample_data.json')
with open(SAMPLE_JSON_PATH, 'rb') as sample_json_file:
    SAMPLE_JSON = sample_json_file.read()

db_url = os.environ.get("DATABASE_URL")
if db_url:
    urlparse.uses_netloc.append("postgres")
    url = urlparse.urlparse(db_url)
    db = web.database(dbn='postgres', user=url.username, pw=url.password,
                      host=url.hostname, port=url.port, db=url.path[1:])
else:
    db = web.database(dbn='postgres', user='dhaas', pw='', db='thresher')

class sampletask:
    def GET(self):
        tid = uuid.uuid4()
        parsed_json = json.loads(SAMPLE_JSON)
        parsed_json['tua']['id'] = str(tid)
        return json.dumps(parsed_json)

    def POST(self):
        i = web.input(tid=None)
        if i.tid:
            db.insert('task', tid=i.tid, data=i.data)

class submittedtask:
    def GET(self):
        i = web.input(tid=None)
        tid = i.tid
        if tid:
            tasks = db.select('task', {'tid':i.tid}, where="tid = $tid")
            if tasks:
                return tasks[0].data
            return {}
        else:
            tasks = db.select('task')
            return json.dumps([json.loads(task.data) for task in tasks])

class resettask:
    def POST(self):
        db.delete('task', where="true")
        return "DELETED!"

if __name__ == '__main__':
    app = web.application(urls, globals())
    app.run()
