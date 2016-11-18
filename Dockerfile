FROM python:2.7-slim
ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y \
        gcc \
        gettext \
        postgresql-client libpq-dev \
        less

RUN rm -rf /var/lib/apt/lists/*

EXPOSE 5000


WORKDIR /home/thresher
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Development conveniences, especially setting TERM=xterm
COPY bashrc_to_docker /root/.bashrc

# ipython for development - not (currently) needed for production
RUN pip install ipython

CMD ["gunicorn", "-b", ":5000", "-w", "10", "--error-logfile", "-", \
                 "thresher_backend.wsgi"]
