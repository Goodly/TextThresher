from django.conf.urls import include, url
from django.views.generic import RedirectView
from django.contrib import admin
admin.autodiscover()

urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/', include('thresher.urls')),
    url(r'^researcher/', include('researcher.urls')),
    url(r'^django-rq/', include('django_rq.urls')),
    url(r'^auth/', include('rest_framework.urls')),
    url(r'^$', RedirectView.as_view(url='/admin/')),
]
