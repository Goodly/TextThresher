Text Thresher Backend
=====================

The backend for Text Thresher, a tool for decomposing and annotating articles
using the crowd. Under development for the
[Deciding Force Project](http://www.decidingforce.org/).

The latest version of the backend is running
[on heroku](http://text-thresher.herokuapp.com/api). The API is browsable.

#### Running the app locally

- install heroku toolbelt
  [(details)](https://devcenter.heroku.com/articles/getting-started-with-python#set-up)

- install and run postgres:
  - do the install (with apt-get or brew, depending on your OS). 
  - Set up access control:
    - Find the pg_hba.conf file:
    
            $ sudo -u postgres psql
            > show hba_file;
            > \q
		
    - Edit the pg_hba.conf file, and change the line starting with "local all" to "local" "all" "all" "trust"
		
	- Restart postgres:
	
            $ sudo /etc/init.d/postgresql restart <-- On Linux
            $ pg_ctl -D /usr/local/var/postgres/ -l /usr/local/var/postgres/server.log restart <-- on OSX

	- Create the Django DB user (it should match the user in the `settings.py` file):

		    $ sudo -su postgres
		    $ createuser --superuser USER_NAME
		    $ exit
		
	- Create the database(should match the database in `settings.py`, right now `thresher`):

		    $ createdb -O USER_NAME -U USER_NAME thresher

- set up a virtualenv

- install packages with `pip install -r requirements.txt`

- prepare static files with `python manage.py collectstatic --noinput`

- prepare the database with `./reset_db.sh`

- Load the data with `python load_data.py -s SCHEMA_DIR -d ARTICLE_DIR`, where `SCHEMA_DIR` is a directory
  containing a `.txt` file for each module topology, and `ARTICLE_DIR` is a directory containing a `.txt`
  file for each raw article. If you do not have access to a complete copy of the data, a sample schema and
  article directory are available under `text-thresher-backend/data/sample`.

- run the app with `foreman start`

- view the API in the browser at `http://127.0.0.1:5000/api/`

#### Deployment

- push the code to Heroku `git push heroku`

- Reset the db with `heroku pg:reset postgres --confirm text-thresher`

- Prepare the database. You have two options.

  - To initialize the database but not load data, run
    `heroku run python manage.py syncdb`

  - To initialize the database with a copy of your local data, verify that your
    local postgres database has data and works when you run the app locally,
    then run `heroku pg:push LOCAL_DB_NAME postgres`

- Visit the application to make sure it worked

#### API

The API is mostly self-documenting in
[the browsable interface](http://text-thresher.herokuapp.com/api), but there are
API calls that aren't readily apparent there:

- GET /api/tuas/random : get a random TUA that hasn't yet been processed.
