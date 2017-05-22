FROM python:2.7-slim
ENV PYTHONUNBUFFERED 1
ENV TERM xterm

# helpful aliases
COPY /docker/bashrc_to_docker /root/.bashrc

# ARG vars exist only during build and can be overridden by --build-args
ARG DEBIAN_FRONTEND=noninteractive

# git a dependency of bower
RUN apt-get update -q && apt-get install -q -y \
        gcc \
        gettext \
        postgresql-client libpq-dev \
        git \
        less

RUN rm -rf /var/lib/apt/lists/*

WORKDIR /home/build
COPY /docker/thresher_api/requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# ipython for development - not (currently) needed for production
RUN pip install ipython

ARG USER=thresher
ARG USER_ID=9000
ARG GROUP_ID=9000
ARG HOME=/home/webpack_build
RUN groupadd -g ${GROUP_ID} ${USER} && \
      useradd --shell /bin/bash --home ${HOME} -u ${USER_ID} -g ${GROUP_ID} ${USER}
COPY /docker/bashrc_to_docker ${HOME}/.bashrc

ENV PYTHONPATH /home/thresher
# note: Development config mounts a host volume on this path.
WORKDIR /home/thresher
COPY / /home/thresher
RUN chown -R ${USER}:${USER} /home/thresher

WORKDIR /home/download
# https://nodejs.org/dist/v6.10.3/node-v6.10.3-linux-x64.tar.xz
ARG NODE_VERSION=v6.10.3
ARG NODE_FILE=node-${NODE_VERSION}-linux-x64.tar.xz
# This merges files into /usr/local/{bin,include,lib,share}
# So node is installed for all users
RUN curl -O https://nodejs.org/dist/${NODE_VERSION}/${NODE_FILE}
RUN tar -C /usr/local --strip-components 1 -xf ${NODE_FILE}

# Let Django copy to static dir as regular user
WORKDIR /var/www
RUN chown ${USER}:${USER} /var/www

WORKDIR /home/webpack_build
RUN chown ${USER}:${USER} /home/webpack_build
# have to install -g as root
RUN npm install -g bower
USER ${USER}
WORKDIR /home/webpack_build
ENV WEBPACK_ISOLATED_DIR /home/webpack_build
RUN /home/thresher/docker/thresher_api/isolated_webpack_build.sh
RUN npm run deploy

EXPOSE 5000

CMD ["gunicorn", "-b", ":5000", "-w", "10", "--error-logfile", "-", \
     "--access-logfile", "-", "--reload", \
     "thresher_backend.wsgi"]
