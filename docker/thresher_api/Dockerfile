FROM python:2.7-slim
ENV PYTHONUNBUFFERED 1
ENV TERM xterm

# helpful aliases
COPY bashrc_to_docker /root/.bashrc

# ARG vars exist only during build
ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update -q && apt-get install -q -y \
        gcc \
        gettext \
        postgresql-client libpq-dev \
        less

RUN rm -rf /var/lib/apt/lists/*

EXPOSE 5000

WORKDIR /home/build
COPY ./thresher_api/requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# ipython for development - not (currently) needed for production
RUN pip install ipython

WORKDIR /home/thresher
CMD ["gunicorn", "-b", ":5000", "-w", "10", "--error-logfile", "-", \
                 "thresher_backend.wsgi"]
