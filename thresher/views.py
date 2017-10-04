import logging
logger = logging.getLogger(__name__)

from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView

from models import Article
from serializers import ArticleSerializer2

class ArticleView(RetrieveAPIView):
    """
    /article/view/id

    """
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer2
