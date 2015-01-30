from django.contrib.auth.models import User
from django.core.paginator import Paginator

from rest_framework import routers, viewsets
from rest_framework.decorators import list_route
from rest_framework.response import Response
from rest_framework import status

from models import TUA, Article, AnalysisType, Topic, HighlightGroup
from serializers import (UserSerializer, TUASerializer,
                         ArticleSerializer, AnalysisTypeSerializer,
                         TopicSerializer, HighlightGroupSerializer)

# Views for serving the API

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class TUAViewSet(viewsets.ModelViewSet):
    queryset = TUA.objects.filter(analysis_type=AnalysisType.objects.get(id=1))
    serializer_class = TUASerializer
    paginate_by = 1

    @list_route()
    def random(self, request):
        """Retrieve a random unprocessed TUA."""
        self.object = TUA.objects.filter(
            is_processed=False,
            analysis_type__requires_processing=True).order_by('?')[0]
        serializer = self.get_serializer(self.object)
        return Response(serializer.data)

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer

class AnalysisTypeViewSet(viewsets.ModelViewSet):
    queryset = AnalysisType.objects.all()
    serializer_class = AnalysisTypeSerializer
 
class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer

class HighlightGroupViewSet(viewsets.ModelViewSet):
    queryset = HighlightGroup.objects.all()
    serializer_class = HighlightGroupSerializer

    def post(self, request, *args, **kwargs):
        if isinstance(request.DATA, list):
            serializer = HighlightGroupSerializer(data=request.DATA, many=True)
            if serializer.is_valid():
                self.object = serializer.save(force_insert=True)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        else:
            return super(HighlightGroupViewSet, self).post(request, *args, **kwargs)

# Register our viewsets with the router
ROUTER = routers.DefaultRouter()
ROUTER.register(r'users', UserViewSet)
ROUTER.register(r'tuas', TUAViewSet)
ROUTER.register(r'articles', ArticleViewSet)
ROUTER.register(r'tua_types', AnalysisTypeViewSet)
ROUTER.register(r'topics', TopicViewSet)
ROUTER.register(r'highlight_groups', HighlightGroupViewSet)
