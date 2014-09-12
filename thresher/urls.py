from django.conf.urls import include, url
from rest_framework import routers
from views import ROUTER

urlpatterns = [
    # Add the views we've registered with the default router
    url(r'^', include(ROUTER.urls))
]
