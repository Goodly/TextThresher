from .settings import *

installed_apps = list(INSTALLED_APPS)
installed_apps.append('django_extensions')
INSTALLED_APPS = tuple(installed_apps)

GRAPH_MODELS = {
}
