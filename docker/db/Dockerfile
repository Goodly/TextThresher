FROM postgres:9.4
ENV TERM xterm

# helpful aliases
COPY bashrc_to_docker /root/.bashrc

# ARG vars exist only during build
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update -q
RUN apt-get install -q -y apt-utils
RUN apt-get install -q -y less vim-tiny

RUN rm -rf /var/lib/apt/lists/*

WORKDIR /docker-entrypoint-initdb.d
COPY ./db/init-user-db.sh .
