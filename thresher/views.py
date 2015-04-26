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
    serializer_class = TUASerializer
    paginate_by = 1
    
    def get_queryset(self):
        analysis_types = AnalysisType.objects.filter(name="Protester")
        if analysis_types:
            protester_type = analysis_types[0]
            return TUA.objects.filter(analysis_type=protester_type)
        else:
            return TUA.objects.all()

    @list_route()
    def random(self, request):
        """Retrieve a random unprocessed TUA."""
        tuas = self.get_queryset()
        self.object = tuas.filter(
            is_processed=False,
            analysis_type__requires_processing=True).order_by('?')[0]
        serializer = self.get_serializer(self.object)
        data = {}
        data['results'] = [serializer.data]
        data['count'] = 1
        data['previous'] = None
        data['next'] = request.build_absolute_uri()
        return Response(data)

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

    def create(self, request, *args, **kwargs):
        if isinstance(request.DATA, list):
            serializer = HighlightGroupSerializer(data=request.DATA, many=True)
            if serializer.is_valid():
                self.object = serializer.save(force_insert=True)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        else:
            return super(HighlightGroupViewSet, self).create(request, *args, **kwargs)

# Register our viewsets with the router
ROUTER = routers.DefaultRouter()
ROUTER.register(r'users', UserViewSet)
ROUTER.register(r'tuas', TUAViewSet, base_name='tua')
ROUTER.register(r'articles', ArticleViewSet)
ROUTER.register(r'tua_types', AnalysisTypeViewSet)
ROUTER.register(r'topics', TopicViewSet)
ROUTER.register(r'highlight_groups', HighlightGroupViewSet)
