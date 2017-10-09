from django.conf.urls import include, url
from . import views

app_name = 'api'
urlpatterns = [
    url(r'^article/view/(?P<pk>[0-9]+)$',
        views.ArticleView.as_view(),
        name="article_view"),
]
