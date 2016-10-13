FROM python:2.7-slim
ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y \
        gcc \
        gettext \
        postgresql-client libpq-dev

RUN rm -rf /var/lib/apt/lists/*

EXPOSE 5000

WORKDIR /home/thresher
COPY requirements.txt .
RUN pip install -r requirements.txt

CMD ["gunicorn", "-b", ":5000", "--error-logfile", "-", \
                 "--access-logfile", "-", "thresher_backend.wsgi"]

