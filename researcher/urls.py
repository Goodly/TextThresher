from django.conf.urls import include, url
from django.views.generic import TemplateView
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
    url(r'^help/schema/$',
        TemplateView.as_view(template_name="researcher/help_schema.html"),
        name='help_schema'),
    url(r'^nlp_articles/$',
        views.NLPArticlesView.as_view(),
        name='nlp_articles'),
    url(r'^create_project/$',
        views.CreateProjectView.as_view(),
        name='create_project'),
    url(r'^project/(?P<pk>[0-9]+)/edit/$',
        views.EditProjectView.as_view(),
        name='edit_project'),
    url(r'^project/(?P<pk>[0-9]+)/addtasks/$',
        views.AddTasksView.as_view(),
        name='add_project_tasks'),
    url(r'^project/(?P<pk>[0-9]+)/taskruns/$',
        views.RetrieveTaskrunsView.as_view(),
        name='retrieve_taskruns'),
    url(r'^remoteproject/(?P<pk>[0-9]+)/delete/$',
        views.RemoteProjectDeleteView.as_view(),
        name='remote_project_delete')
]
