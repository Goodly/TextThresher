from django.conf.urls import include, url
from . import views

app_name = 'api'
urlpatterns = [
    url(r'^article/review/(?P<pk>[0-9]+)$',
        views.ArticleReview.as_view(),
        name="article_review"),
]
