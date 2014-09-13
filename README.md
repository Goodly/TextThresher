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

- install and run postgres. Create a database according to the settings in
  `thresher_backend/settings.py`

- set up a virtualenv

- install packages with `pip install -r requirements.txt`

- prepare static files with `python manage.py collectstatic --noinput`

- prepare the database with `./reset_db.sh`

- Load the data with `python load_data.py -s SCHEMA_DIR -d ARTICLE_DIR`

- run the app with `foreman start`

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