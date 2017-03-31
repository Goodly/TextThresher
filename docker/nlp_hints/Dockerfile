FROM python:2.7-slim
ENV PYTHONUNBUFFERED 1
ENV TERM xterm

# helpful aliases
COPY bashrc_to_docker /root/.bashrc

# ARG vars exist only during build
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update -q && apt-get install -y --no-install-recommends \
        apt-transport-https ca-certificates \
        software-properties-common

RUN echo "deb http://ppa.launchpad.net/ansible/ansible/ubuntu xenial main" | tee /etc/apt/sources.list.d/webupd8team-java.list
# Ansible key
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 93C4A3FD7BB9C367

RUN echo "deb http://ppa.launchpad.net/webupd8team/java/ubuntu xenial main" | tee /etc/apt/sources.list.d/webupd8team-java.list
RUN echo "deb-src http://ppa.launchpad.net/webupd8team/java/ubuntu xenial main" | tee -a /etc/apt/sources.list.d/webupd8team-java.list
# Oracle key
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys EEA14886

RUN apt-get update -q

RUN echo debconf shared/accepted-oracle-license-v1-1 select true | debconf-set-selections
RUN echo debconf shared/accepted-oracle-license-v1-1 seen true | debconf-set-selections

RUN apt-get install -y --no-install-recommends \
        gcc build-essential \
        git-core curl less vim psmisc \
        redis-tools \
        oracle-java8-installer oracle-java8-set-default

ENV JAVA_HOME="/usr/lib/jvm/java-8-oracle/jre"
RUN apt-get install -y --no-install-recommends maven

# Borrowed script to install LANG=en_US.UTF-8 LC_CTYPE=en_US.UTF-8
#WORKDIR /bd_build
#COPY ./bd_build /bd_build
#RUN ./prepare.sh

RUN rm -rf /var/lib/apt/lists/*

WORKDIR /home
RUN git clone https://github.com/Goodly/NLP-hints nlp_hints
WORKDIR /home/nlp_hints
RUN mvn clean compile

WORKDIR /home/nlp_worker
COPY ./nlp_hints/requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY ./nlp_hints/nlp_worker ./nlp_worker
ENV PYTHONPATH=/home/nlp_worker

# Maven wants to run in this dir
WORKDIR /home/nlp_hints

CMD ["/usr/local/bin/rq", "worker", "nlp_exporter", "--url", "redis://django_rq/0"]
