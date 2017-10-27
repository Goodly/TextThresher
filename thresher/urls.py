from django.conf.urls import include, url
from . import views

app_name = 'api'
urlpatterns = [
    url(r'^articles/$',
        views.ArticleList.as_view(),
        name="article_list"),
]
