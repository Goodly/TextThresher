from django.conf.urls import include, url
from django.contrib import admin
from django.views.generic import RedirectView

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^api/', include('thresher.urls')),
    url(r'^researcher/', include('researcher.urls')),
    url(r'^django-rq/', include('django_rq.urls')),
    url(r'^auth/', include('rest_framework.urls')),
    url(r'^$', RedirectView.as_view(url='/researcher/')),
]
