import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "thresher_backend.settings")
import django
django.setup()
from django.db import connection
from django.conf import settings

import logging
logger = logging.getLogger(__name__)

import json
import requests
from requests.compat import urljoin
import django_rq
import pbclient

from thresher.models import Article, Topic, Project
from thresher.views import collectHighlightTasks, collectQuizTasks
from data import init_defaults

def get_empty_project():
    return pbclient.Project({
        "name": "",
        "short_name": "",
        "description": "",
        "info": {
          "task_presenter": ""
        }
    })

def create_project(profile, project, payload):
    headers = {'content-type': 'application/json'}
    url = urljoin(profile.pybossa_url, "/api/project")
    params = {'api_key': profile.pybossa_api_key }
    payload.name = project.name
    payload.short_name = project.short_name
    payload.description = "Add project description here."
    resp = requests.post(url, params=params,
                         headers=headers, timeout=30,
                         data=json.dumps(payload.data))
    result = resp.json()
    if resp.status_code / 100 == 2 and result.get('id'):
        try:
            project.pybossa_id = int(result.get('id',''))
            project.save()
            logger.info("Created project at %s" % (project.getURL(profile)))
        except ValueError:
            logger.error("Error converting project id '%s' to integer." % (result.get('id','')))
    else:
        logger.warn("Status %d when trying to create %s. %s" % (
                    resp.status_code, project.name, result['exception_msg']))
    return result

def delete_project(profile, project):
    headers = {'content-type': 'application/json'}
    result = {}
    if not project.pybossa_id:
        logger.warn("No id known for deleting %s" % (project.name))
        return result
    url = urljoin(profile.pybossa_url, "/api/project/%d" % (project.pybossa_id))
    params = {'api_key': profile.pybossa_api_key }
    resp = requests.delete(url, params=params, headers=headers, timeout=30)
    if resp.status_code / 100 == 2:
        project.pybossa_id = None
        project.save()
        logger.info("Deleted project at %s" % (project.getURL(profile)))
    else:
        result = resp.json()
        logger.warn("Status %d when trying to delete %s. %s" % (
                    resp.status_code, project.name, result['exception_msg']))
        logger.info(result.keys().__str__())
    return result

def setHighlighterPresenter(payload):
    bundlePath = settings.HIGHLIGHTER_BUNDLE_JS
    if os.path.isfile(bundlePath):
        with open(bundlePath) as f:
            js = f.read()
        payload.info['task_presenter'] = "<script>\n%s\n</script>" % js
    else:
        logger.error("Bundle not found: %s" % (bundlePath))

def setQuizPresenter(payload):
    bundlePath = settings.QUIZ_BUNDLE_JS
    if os.path.isfile(bundlePath):
        with open(bundlePath) as f:
            js = f.read()
        payload.info['task_presenter'] = "<script>\n%s\n</script>" % js
    else:
        logger.error("Bundle not found: %s" % (bundlePath))

def createRemoteProjects():
    researchers = init_defaults.createThresherGroup()
    profile = init_defaults.createNick(groups=[researchers])

    hproject = init_defaults.createHighlighterProject()
    hproject_data = get_empty_project()
    setHighlighterPresenter(hproject_data)
    create_project(profile, hproject, hproject_data)

    qproject = init_defaults.createQuizProject()
    qproject_data = get_empty_project()
    setQuizPresenter(qproject_data)
    create_project(profile, qproject, qproject_data)

def deleteRemoteProjects():
    researchers = init_defaults.createThresherGroup()
    profile = init_defaults.createNick(groups=[researchers])
    hproject = init_defaults.createHighlighterProject()
    delete_project(profile, hproject)
    qproject = init_defaults.createQuizProject()
    delete_project(profile, qproject)


if __name__ == '__main__':
    logger.info("Highlighter bundle: %s" % settings.HIGHLIGHTER_BUNDLE_JS)
    logger.info("Quiz bundle: %s" % settings.QUIZ_BUNDLE_JS)
    highlightTasks = collectHighlightTasks(
        articles = Article.objects.all(),
        topics = Topic.objects.filter(parent=None),
        project = Project.objects.get(name__exact="Deciding Force Highlighter")
    )
    logger.info("number of highlight tasks %d" % len(highlightTasks))
    queryCount = len(connection.queries)
    logger.info("number of queries %d" % (queryCount))

    quizTasks = collectQuizTasks(
        topic = Topic.objects.get(name__exact="Protester"),
        project = Project.objects.get(name__exact="Deciding Force Quiz")
    )
    logger.info("number of quiz tasks %d" % len(quizTasks))
    queryCount2 = len(connection.queries)
    logger.info("number of queries %d" % (queryCount2 - queryCount))

    createRemoteProjects()
