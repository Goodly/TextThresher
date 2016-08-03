# annotator-content-analysis

An annotation interface for detailed text annotation by crowdworkers along researcher-defined topics of interest. Under development for the
[Deciding Force Project](http://www.decidingforce.org/). Currently, this app only runs locally.

Built with [React](https://facebook.github.io/react/) and [Redux](https://github.com/reactjs/redux).

####To setup

From the project directory, run

```
npm install
bower install
```

The backend is supported by Docker.

To install Docker:
* For OS X, go [here](https://docs.docker.com/docker-for-mac/).
* For Windows, go [here](https://docs.docker.com/docker-for-windows/).
* For Ubuntu and other Linux distributions, go [here](https://docs.docker.com/engine/installation/linux/ubuntulinux/).

You might also want to install Devtools for [React](https://facebook.github.io/react/blog/2015/09/02/new-react-developer-tools.html). For Redux, you can install the [Google Chrome extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) or use the other methods described in the README [here](https://github.com/zalmoxisus/redux-devtools-extension).

####To run the Docker server

Go to the project directory: 

1. Run `docker-compose up`.
2. Run `./init_docker.sh`.

Once the containers are seeded, run `docker-compose start`. After this, you should be able to make your first query.

**Note:** If you are setting up Docker a second time, you may want to first remove the database container with `docker-compose rm db`.

####To develop

In the project directory, run `npm run dev` and set up the Docker server as described above to build and serve the development app.

To make your first query, navigate to `localhost:5000/api`.

####To deploy

In the project dictory, run `npm run deploy` and set up the Docker server as described above. The output files will be written to the `dist` folder.

**NOTE:** this command currently currently not fully functional and needs to be upgraded. Running `npm run dev` instead will show the most recent version of the code.