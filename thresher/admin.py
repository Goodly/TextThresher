from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from thresher.models import (UserProfile, Project, Article,
                             ArticleHighlight, HighlightGroup,
                             Topic, Question, Answer,
                             SubmittedAnswer)

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

admin.site.register(Project)
admin.site.register(Article)
admin.site.register(ArticleHighlight)
admin.site.register(HighlightGroup)
admin.site.register(Topic)
admin.site.register(Question)
admin.site.register(Answer)
admin.site.register(SubmittedAnswer)
