FROM python:2.7-slim

RUN apt-get update && apt-get install -y \
        gcc \
        gettext \
        postgresql-client libpq-dev && rm -rf /var/lib/apt/lists/*

ENV DJANGO_VERSION 1.9.6

COPY requirements.txt .
RUN pip install -r requirements.txt

EXPOSE 5000
WORKDIR /home/thresher
CMD ["gunicorn", "-b", ":5000", "--error-logfile", "-", \
                 "--access-logfile", "-", "thresher_backend.wsgi"]

