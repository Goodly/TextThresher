import os
import urlparse
import web

urls = (
    '/tasks', 'sampletask',
)


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
        # TODO, add sample json document.
        tests = db.select('test')
        return 'somejson: ' + ';'.join(["a=%d,b=%d" % (test.a, test.b)
                                        for test in tests])

    def POST(self):
        # TODO, store stuff in the DB
        i = web.input()
        db.insert('test', a=i.a, b=i.b)

    def reset_db(self):
        db.delete('test')

if __name__ == '__main__':
    app = web.application(urls, globals())
    app.run()
