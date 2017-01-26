FROM ubuntu:14.04.5
ENV PYTHONUNBUFFERED 1
ENV TERM xterm

# helpful aliases
COPY bashrc_to_docker /root/.bashrc

# ARG vars exist only during build
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update -q && apt-get install -y --no-install-recommends \
        apt-transport-https ca-certificates

RUN apt-get install -y --no-install-recommends \
        git-core curl less psmisc \
        software-properties-common \
        build-essential libssl-dev libffi-dev

# Install the packages that Pybossa will want so they are
# cached by Docker and not reinstalled by Ansible each time
RUN apt-get install -y --no-install-recommends \
        python python-dev python-virtualenv \
        python-setuptools python-pip \
        libjpeg-dev swig \
        dbus libdbus-1-dev libdbus-glib-1-dev \
        postgresql-client postgresql-server-dev-all libpq-dev python-psycopg2 \
        redis-server nginx

RUN apt-add-repository ppa:ansible/ansible
RUN apt-get update -q && apt-get install -y --no-install-recommends \
        ansible

# Borrowed script to install LANG=en_US.UTF-8 LC_CTYPE=en_US.UTF-8
WORKDIR /bd_build
COPY ./bd_build /bd_build
RUN ./prepare.sh

WORKDIR /ansible_build
COPY ./pybossa .
RUN ansible-playbook playbook.yml -i ansible_hosts -c local

RUN rm -rf /var/lib/apt/lists/*

# most useful dir to end up in after "docker-compose exec pybossa bash"
WORKDIR /home/pybossa

EXPOSE 5000
CMD ["/usr/local/bin/supervisord", \
     "--nodaemon", \
     "--configuration=/etc/supervisor/supervisord.conf"]
