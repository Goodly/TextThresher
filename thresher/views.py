import logging
logger = logging.getLogger(__name__)

from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination

from django_filters.rest_framework import BaseInFilter, NumberFilter
from django_filters.rest_framework import FilterSet, DjangoFilterBackend


from models import Article
from serializers import ArticleSerializer2

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000


class NumberInFilter(BaseInFilter, NumberFilter):
    pass


class ArticleNumberIn(FilterSet):
    article_number__in = NumberInFilter(name='article_number', lookup_expr='in')

    class Meta:
        model = Article
        fields = ('article_number',)


class ArticleList(ListAPIView):
    """
    /article
    """
    queryset = Article.objects.all().order_by('article_number')
    serializer_class = ArticleSerializer2
    filter_backends = (DjangoFilterBackend,)
    filter_class = ArticleNumberIn
    pagination_class = StandardResultsSetPagination
