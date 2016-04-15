Text Thresher Backend
=====================

The backend for Text Thresher, a tool for decomposing and annotating articles
using the crowd. Under development for the
[Deciding Force Project](http://www.decidingforce.org/).

The latest version of the backend is running
[on heroku](http://text-thresher.herokuapp.com/api). The API is browsable.

#### Running the app locally

1. Install Docker
2. On OSX, run `eval $(docker-machine env default)`
3. Run `docker-compose up`

The server should now be up and running.  Initialize it by running
`./init_docker.sh`.

You should now be able to make your first query:

- Find your Docker machine's ip using `docker-machine ip default`, let's say
  it is `192.168.0.100`
- Browse to `http://192.168.0.100/api`


**Note:** If you are doing this a second time, you may want to first remove
the database container with `docker-compose rm db``


The instructions below are for a local installation:

**Note:** the instructions below assume that PostgreSQL is being run as user
"postgres".  If that is not the case (e.g., if you are running it under your
own username), change or neglect the sudo commands as appropriate.

* Install heroku toolbelt
  [(details)](https://devcenter.heroku.com/articles/getting-started-with-python#set-up)

* Install and run postgres:
    * Do the install (with apt-get or brew, depending on your OS). 
    * Set up access control:
        * Find the pg_hba.conf (PostgreSQL Client Authentication Configuration) file by executing the following command:
        ```shell
        sudo -u postgres psql -c 'show hba_file'
        ```
        * Edit the pg_hba.conf file, and ensure that the line starting with `local all` becomes:
        `local all all trust`
        (This is already the case with default brew installations.)

    * Restart postgres:
      On Linux:
      ```shell
      sudo /etc/init.d/postgresql restart
      ```
      On OSX:
      ```shell
      pg_ctl -D /usr/local/var/postgres/ -l /usr/local/var/postgres/server.log restart
      ```
* Create the Django DB user (it should match the user in the `thresher_backend/settings.py` file, and is `zz` by default):
  ```shell
  sudo -su postgres createuser --superuser USER_NAME
  ```

* Create the database (should match the database in `settings.py`, default `thresher`):
  ```shell
  createdb -O USER_NAME -U USER_NAME thresher
  ```

* Set up a virtualenv

* Install packages with 
  ```shell
  pip install -r requirements.txt
  ```
  **Note:** If you are running conda, it is better to install the requirements
  using the conda package manager.  At least, you will *have* to `pip
  uninstall psycopg2` and `conda install psycopg2` to ensure that you
  get the correct libSSL linked version.

* Edit ``thresher_backend/settings.py`` and modify the database hostname from
  ``db`` to ``localhost``.

* Prepare static files with 
  ```shell
  python manage.py collectstatic --noinput
  ```

* Prepare the database with `./reset_db.sh`
  
  When asked whether to add a superuser, say "no".
  [comment]: <> (TODO: should this be "yes"?)

* Load the data with `python load_data.py -s SCHEMA_DIR -d ARTICLE_DIR`, where `SCHEMA_DIR` is a directory containing a `.txt` file for each module topology, and `ARTICLE_DIR` is a directory containing a `.txt` file for each raw article.
If you do not have access to a complete copy of the data, a sample schema and article directory are available under `text-thresher-backend/data/sample`.
  ```
  python load_data.py -s data/sample/schema/ -d data/sample/article/
  ```

- Run the app with `foreman start`

- View the API in the browser at [http://127.0.0.1:5000/api/](http://127.0.0.1:5000/api/)

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
