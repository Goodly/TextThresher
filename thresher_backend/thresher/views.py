from django.contrib.auth.models import User
from rest_framework import routers, viewsets
from rest_framework.decorators import list_route
from rest_framework.response import Response
from models import TUA, Article, AnalysisType
from serializers import (UserSerializer, TUASerializer,
                         ArticleSerializer, AnalysisTypeSerializer)

# Views for serving the API

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class TUAViewSet(viewsets.ModelViewSet):
    queryset = TUA.objects.all()
    serializer_class = TUASerializer

    @list_route()
    def random(self, request):
        """Retrieve a random unprocessed TUA."""
        self.object = TUA.objects.filter(is_processed=False).order_by('?')[0]
        serializer = self.get_serializer(self.object)
        return Response(serializer.data)

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer

class AnalysisTypeViewSet(viewsets.ModelViewSet):
    queryset = AnalysisType.objects.all()
    serializer_class = AnalysisTypeSerializer

# Register our viewsets with the router
ROUTER = routers.DefaultRouter()
ROUTER.register(r'users', UserViewSet)
ROUTER.register(r'tuas', TUAViewSet)
ROUTER.register(r'articles', ArticleViewSet)
ROUTER.register(r'tua_types', AnalysisTypeViewSet)
