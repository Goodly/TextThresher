# TextThresher

An annotation interface for detailed text annotation by crowdworkers along researcher-defined topics of interest. Under development for the
[Deciding Force Project](http://www.decidingforce.org/). Currently, this app only runs locally.

Built with [React](https://facebook.github.io/react/) and [Redux](https://github.com/reactjs/redux).

# To setup

The backend is supported by Docker. If you do not have it already, you will need to install it.
* For OS X, go [here](https://docs.docker.com/docker-for-mac/).
* For Windows, go [here](https://docs.docker.com/docker-for-windows/).
* For Ubuntu and other Linux distributions, install
[docker](https://docs.docker.com/engine/installation/linux/ubuntulinux/) and
[docker-compose](https://docs.docker.com/compose/install/).
  To [avoid having to use sudo when you use the docker command](https://docs.docker.com/engine/installation/linux/ubuntulinux/#/create-a-docker-group),
create a Unix group called docker and add users to it:
  1. `sudo groupadd docker`
  2. `sudo usermod -aG docker $USER`

Once installed, start the Docker application (if on a Mac), then go to the project directory and run:

1. `docker-compose up -d`
2. `./init_docker.sh`
3. `npm install`
4. `bower install`

You will only need to run the above commands once. Those will do the preliminary setup for the application by installing the dependencies and seeding the Docker containers to setup the database.

Use `docker-compose stop` to stop the containers or `docker-compose down` to both stop and remove the containers.

You might also want to install Devtools for [React](https://facebook.github.io/react/blog/2015/09/02/new-react-developer-tools.html). For Redux, you can install the [Google Chrome extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) or use the other methods described in the README [here](https://github.com/zalmoxisus/redux-devtools-extension).

**Note:** If you are setting up Docker a second time, you may want to first remove the previous database containers with `docker-compose rm db`.

# To develop

In the project directory, run `docker-compose start` and `npm run dev`.

To view a browsable interface for the queries, navigate to `localhost:5000/api`. Another browsable interface is available [on Heroku](http://text-thresher.herokuapp.com/api/), but is not fully up-to-date.

**Note:** If you encounter an error that the module `text-highlighter/src/TextHighlighter` cannot be found, you will need to update brew by running `brew update`. 

# To deploy

In the project dictory, run `docker-compose start` and `npm run deploy`. The output files will be written to the `dist` folder.

**NOTE:** this command currently currently not fully functional and needs to be upgraded. Running `npm run dev` instead will show the most recent version of the code.

To deploy the backend to Heroku:

- push the code to Heroku `git push heroku`

- Reset the db with `heroku pg:reset postgres --confirm text-thresher`

- Prepare the database. You have two options.

- To initialize the database but not load data, run `heroku run python manage.py syncdb`

- To initialize the database with a copy of your local data, verify that your
local postgres database has data and works when you run the app locally,
then run `heroku pg:push LOCAL_DB_NAME postgres`

- Visit the [application](http://text-thresher.herokuapp.com/api/) to make sure it worked.
