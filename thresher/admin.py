from django.contrib import admin
from thresher.models import *
from django.contrib.auth.admin import UserAdmin

class UserProfileInLine(admin.StackedInline):
	model = UserProfile
	verbose_name_plural = 'user'

class NewUserAdmin(UserAdmin):
	inlines = [
		UserProfileInLine,	
	]

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, NewUserAdmin)

admin.site.register(Client)
admin.site.register(Article)
admin.site.register(AnalysisType)
admin.site.register(TUA)
admin.site.register(Topic)
admin.site.register(Question)
admin.site.register(Answer)
admin.site.register(HighlightGroup)
admin.site.register(MCSubmittedAnswer)
admin.site.register(CLSubmittedAnswer)
admin.site.register(TBSubmittedAnswer)
admin.site.register(DTSubmittedAnswer)

