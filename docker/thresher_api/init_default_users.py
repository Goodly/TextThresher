# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "thresher_backend.settings")

import django
django.setup()
from django.conf import settings

from django.contrib.auth.models import User, Permission, Group

permissions = [
    u'add_answer',
    u'change_answer',
    u'delete_answer',
    u'add_article',
    u'change_article',
    u'delete_article',
    u'add_articlehighlight',
    u'change_articlehighlight',
    u'delete_articlehighlight',
    u'add_highlightgroup',
    u'change_highlightgroup',
    u'delete_highlightgroup',
    u'add_project',
    u'change_project',
    u'delete_project',
    u'add_question',
    u'change_question',
    u'delete_question',
    u'add_submittedanswer',
    u'change_submittedanswer',
    u'delete_submittedanswer',
    u'add_topic',
    u'change_topic',
    u'delete_topic',
]

def createSuperUser():
    User.objects.create_superuser('norman', 'norman@example.com', 'bidsatdoe')

def createThresherGroup():
    permlist = Permission.objects.filter(codename__in=permissions)
    researchers = Group.objects.get_or_create(name="Researchers")[0]
    researchers.permissions.set(permlist)
    return researchers

def createNick(groups=[]):
    u = User.objects.create_user('nick', 'nick@example.com', 'bidsatdoe')
    u.first_name = "Nick"
    u.last_name = "Adams"
    u.is_staff = True
    u.groups = groups
    u.save()

if __name__ == '__main__':
    createSuperUser()
    print "Created superuser norman, password 'bidsatdoe'."
    researchers = createThresherGroup()
    print "Created 'Researchers' group with TextThresher permissions."
    createNick(groups=[researchers])
    print "Created researcher 'nick', password 'bidsatdoe'."
