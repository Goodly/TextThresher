from django.contrib import admin
from thresher.models import *

admin.site.register(Article)
admin.site.register(AnalysisType)
admin.site.register(TUA)
admin.site.register(Topic)
admin.site.register(Question)
admin.site.register(Answer)
admin.site.register(MCHighlightGroup)
admin.site.register(CLHighlightGroup)
admin.site.register(TBHighlightGroup)
admin.site.register(DTHighlightGroup)

