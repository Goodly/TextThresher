from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from thresher.models import (Client, Article, AnalysisType,
                             TUA, Topic, Question, Answer, 
                             HighlightGroup, MCSubmittedAnswer,
                             CLSubmittedAnswer, TBSubmittedAnswer, 
                             DTSubmittedAnswer)

class UserProfileInLine(admin.StackedInline):
    """ Class meant to serve as an inline in the 
    newly defined user. An inline allows the 
    UserProfile class to be modified directly 
    through the User class, since an inline gets
    modified on the same page as its parent on the
    admin page. """

    model = UserProfile
    verbose_name_plural = 'user'

# Create a new User admin, adding the appropriate inline
class NewUserAdmin(UserAdmin):
    inlines = [
        UserProfileInLine,  
    ]

# Re-register UserAdmin, including the additional attributes added
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