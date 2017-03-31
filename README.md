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

0. `docker-compose build --no-cache`
1. `docker-compose up -d`
2. `./init_docker.sh`
3. `npm install`
4. `bower install`
5. `npm run dev`

You will only need to run the above commands once. Those will do the preliminary setup for the application by installing the dependencies and seeding the Docker containers to setup the database.

Use `docker-compose stop` to stop the containers or `docker-compose down` to both stop and remove the containers.


# To develop

You will have to refresh your containers depending on the types of changes that happen as you develop, or when you switch to another git branch.

If you are NOT CERTAIN what has changed in the current commit since the last
time the containers were initialized and started, the most prudent course
is to perform ALL of the following steps. If you want to take a shortcut,
use the following table as a guide. But you should probably perform ALL
the steps and then test your work before submitting a pull request.

To refresh your containers, first stop and remove them with:

0. `docker-compose down`

|Step |Command |Restart at this step when:|
|---|---|---|
|2.| `docker-compose build`| requirements.txt changes |
|3.| `docker-compose up -d`| sample data changes      |
|4.| `./init_docker.sh`    |                          |
|5.| `npm install`         | package.json changes     |
|6.| `bower install`       | bower.json changes       |
|7.| `npm run dev`         | webpack changes          |
|7.| `npm run build`       | after any changes to front-end code |

To view a browsable interface for the queries, navigate to `localhost:5000/api/`.

For easier front-end development, we recommend
[React Dev Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
and the
[Redux Dev Tools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd).
Other install options for Redux DevTools are discussed in
[Redux DevTools Extension README](https://github.com/zalmoxisus/redux-devtools-extension).
