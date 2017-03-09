from django.conf.urls import include, url
from . import views

app_name = 'researcher'
urlpatterns = [
    url(r'^$',
        views.IndexView.as_view(),
        name='index'),
    url(r'^upload_articles/$',
        views.UploadArticlesView.as_view(),
        name='upload_articles'),
    url(r'^upload_schema/$',
        views.UploadSchemaView.as_view(),
        name='upload_schema'),
    url(r'^send_tasks/$',
        views.SendTasksView.as_view(),
        name='send_tasks'),
    url(r'^remoteproject/(?P<pk>[0-9]+)/delete/$',
        views.RemoteProjectDeleteView.as_view(),
        name='remote_project_delete')
]
