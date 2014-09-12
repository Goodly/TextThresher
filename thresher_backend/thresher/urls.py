from django.conf.urls import patterns, include, url
from django.contrib.auth.models import User
from rest_framework import routers, serializers, viewsets
from models import TUA

# Allow user creation via the API browser
# Serializers define the API representation.
class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'username', 'email', 'is_staff')

# ViewSets define the view behavior.
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter()
router.register(r'users', UserViewSet)


# Expose TUAs via the API
class TUASerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = TUA
        fields = ('tua_id', 'offsets')

class TUAViewSet(viewsets.ModelViewSet):
    queryset = TUA.objects.all()
    serializer_class = TUASerializer

router.register(r'tuas', TUAViewSet)

urlpatterns = [
    # Examples:
    # url(r'^$', 'thresher_backend.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

#    url(r'tasks/$', 'thresher.views.get_task'), # handle POST too
#    url(r''),
    url(r'^', include(router.urls))
]
