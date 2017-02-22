# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import logging
logger = logging.getLogger(__name__)

import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "thresher_backend.settings")

import django
django.setup()
from django.conf import settings

from django.contrib.auth.models import User, Permission, Group
from django.core.exceptions import ObjectDoesNotExist
from thresher.models import UserProfile, Project

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

def createSuperUser(username="norman", email="norman@example.com", password="bidsatdoe"):
    try:
        u = User.objects.get(username=username)
    except ObjectDoesNotExist:
        u = User.objects.create_superuser(username, email, password)
        profile = UserProfile.objects.get_or_create(
            user=u,
            defaults = {"experience_score": 0.5, "accuracy_score": 0.9}
        )[0]
        logger.info("Created superuser %s, password '%s'." % (username, password))
    return u.userprofile

def createThresherGroup():
    (researchers, created) = Group.objects.get_or_create(name="Researchers")
    if created:
        permlist = Permission.objects.filter(codename__in=permissions)
        researchers.permissions.set(permlist)
        logger.info("Created 'Researchers' group with TextThresher permissions.")
    return researchers

def createNick(username="nick", email="nick@example.com", password="bidsatdoe", groups=[]):
    try:
        u = User.objects.get(username=username)
    except ObjectDoesNotExist:
        u = User.objects.create_user('nick', 'nick@example.com', 'bidsatdoe')
        u.first_name = "Nick"
        u.last_name = "Adams"
        u.is_staff = True
        u.groups = groups
        u.save()
        profile = UserProfile.objects.get_or_create(
            user=u,
            defaults = {"experience_score": 0.98, "accuracy_score": 0.99}
        )[0]
        logger.info("Created researcher '%s', password '%s'." % (username, password))
    return u.userprofile

def createDecidingForce():
    (project, created) =  Project.objects.get_or_create(
        name="Deciding Force",
        instructions="This project analyzes media " +
            "descriptions of interactions " +
            "between police and protestors."
    )
    if created:
        logger.info("Created project 'Deciding Force'")
    return project

if __name__ == '__main__':
    createSuperUser()
    researchers = createThresherGroup()
    createNick(groups=[researchers])
    createDecidingForce()
