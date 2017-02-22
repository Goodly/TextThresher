from django.conf.urls import include, url
from . import views

urlpatterns = [
    url(r'^upload_articles/$',
        views.UploadArticlesView.as_view(),
        name='researcher_upload_articles'),
    url(r'^upload_schema/$',
        views.UploadSchemaView.as_view(),
        name='researcher_upload_schema')
]
