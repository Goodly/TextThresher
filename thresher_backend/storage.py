from django.contrib.staticfiles import storage

# Configure the permissions used by ./manage.py collectstatic
# See https://docs.djangoproject.com/en/1.10/ref/contrib/staticfiles/
class TTStaticFilesStorage(storage.StaticFilesStorage):
    def __init__(self, *args, **kwargs):
        kwargs['file_permissions_mode'] = 0o644
        kwargs['directory_permissions_mode'] = 0o755
        super(TTStaticFilesStorage, self).__init__(*args, **kwargs)
