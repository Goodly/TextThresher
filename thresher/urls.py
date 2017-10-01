from django.conf.urls import include, url
from . import views

urlpatterns = [
    url(r'^highlighter_tasks/$', views.HighlightTasks.as_view()),
]
