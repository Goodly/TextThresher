FROM python:2.7-slim
ENV PYTHONUNBUFFERED 1
ENV TERM xterm

# helpful aliases
COPY /docker/bashrc_to_docker /root/.bashrc

# ARG vars exist only during build and can be overridden by --build-args
ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update -q && apt-get install -q -y \
        gcc \
        gettext \
        postgresql-client libpq-dev \
        vim git curl less psmisc \
        apt-transport-https

RUN curl -sSO https://dl.yarnpkg.com/debian/pubkey.gpg
RUN apt-key add pubkey.gpg
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update -q && apt-get install -q -y yarn

RUN rm -rf /var/lib/apt/lists/*

WORKDIR /home/build
COPY /docker/thresher_api/requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# ipython for development - not (currently) needed for production
RUN pip install ipython

ARG USER=thresher
ARG USER_ID=9000
ARG GROUP_ID=9000
ARG HOME=/home/thresher
RUN groupadd -g ${GROUP_ID} ${USER} && \
      useradd --shell /bin/bash --home ${HOME} -u ${USER_ID} -g ${GROUP_ID} ${USER}

WORKDIR /home/download
# https://nodejs.org/dist/v6.10.3/node-v6.10.3-linux-x64.tar.xz
ARG NODE_VERSION=v6.11.3
ARG NODE_FILE=node-${NODE_VERSION}-linux-x64.tar.xz
# This merges files into /usr/local/{bin,include,lib,share}
# So node is installed for all users
RUN curl -sSO https://nodejs.org/dist/${NODE_VERSION}/${NODE_FILE}
RUN tar -C /usr/local --strip-components 1 -xf ${NODE_FILE}
# Uncomment this if you need to run npm install -g somepackage
# RUN ["chown", "-R", "thresher:thresher", "/usr/local/"]

# Let Django copy to static dir as regular user
WORKDIR /var/www
RUN chown ${USER}:${USER} /var/www

ENV PYTHONPATH /home/thresher
# note: Development config mounts the git repo root on this path.
# Copy minimal files needed to npm install to try
# and re-use cache
ENV WEBPACK_BUILD_DIR /home/thresher
WORKDIR /home/thresher
RUN chown ${USER}:${USER} /home/thresher
COPY /package.json /home/thresher
COPY /yarn.lock /home/thresher

USER ${USER}
RUN yarn install

# Now copy the rest of the repo into the image - any file change breaks build cache
# .dockerignore must exclude node_modules/ and dist/
COPY / /home/thresher
RUN npm run deploy:quiet

COPY /docker/bashrc_to_docker ${HOME}/.bashrc
EXPOSE 5000

# Runs migrate, then replaces sh with 'exec gunicorn...'
CMD ["bash", "docker/thresher_api/migrate_and_run.sh"]
