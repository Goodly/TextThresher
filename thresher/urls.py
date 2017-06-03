from django.conf.urls import include, url
from . import views

urlpatterns = [
    url(r'^highlighter_tasks/$', views.HighlightTasks.as_view()),
    url(r'^quiz_tasks/$', views.quiz_tasks),
    url(r'^nlp_tasks/$', views.NLP_tasks),
]
