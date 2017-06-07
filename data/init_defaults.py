# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import logging
logger = logging.getLogger(__name__)

import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "thresher_backend.settings")

import django
django.setup()
from django.conf import settings

# Retrieve user model set by AUTH_USER_MODEL in settings.py
from django.contrib.auth import get_user_model
User = get_user_model()

from django.contrib.auth.models import Permission, Group
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
    u'add_task',
    u'change_task',
    u'delete_task',
    u'add_nlphints',
    u'change_nlphints',
    u'delete_nlphints',
    u'add_contributor',
    u'change_contributor',
    u'delete_contributor',
    u'add_quiztaskrun',
    u'change_quiztaskrun',
    u'delete_quiztaskrun',
    u'change_userprofile',
]

def createSuperUser(username="norman", email="norman@example.com", password="bidsatdoe"):
    try:
        u = User.objects.get(username=username)
    except ObjectDoesNotExist:
        u = User.objects.create_superuser(username, email, password)
        profile = UserProfile.objects.get_or_create(user=u)[0]
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
            defaults = {"pybossa_url": "http://pybossa"}
        )[0]
        logger.info("Created researcher '%s', password '%s'." % (username, password))
    return u.userprofile

def createHighlighterProject(owner_profile):
    (project, created) =  Project.objects.get_or_create(
        short_name="Highlighter",
        owner_profile=owner_profile,
        defaults = {
            "name": "Highlighter",
            "task_type": "HLTR",
            "instructions": "Highlight passages in articles that discuss " +
                          "the topics shown."
        }
    )
    if created:
        logger.info("Created project '%s'" % project.name)
    return project

def createQuizProject(owner_profile):
    (project, created) =  Project.objects.get_or_create(
        short_name="Quiz",
        owner_profile=owner_profile,
        defaults = {
            "name": "Quiz",
            "task_type": "QUIZ",
            "instructions": "Answer questions about short text passages."
        }
    )
    if created:
        logger.info("Created project '%s'" % project.name)
    return project

if __name__ == '__main__':
    createSuperUser()
    researchers = createThresherGroup()
    owner_profile = createNick(groups=[researchers])
    createHighlighterProject(owner_profile)
    createQuizProject(owner_profile)
