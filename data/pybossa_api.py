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

from thresher.models import Article, Topic, Project, UserProfile
from thresher.views import collectHighlightTasks, collectQuizTasks
from data import init_defaults

class InvalidTaskType(Exception):
    pass

class FileNotFound(Exception):
    pass

def get_empty_project():
    # Note that these pbclient helper objects cannot be Pickled and Unpickled
    # so they cannot be enqueued by Python RQ.
    return pbclient.Project({
        "id": 0,
        "name": "",
        "short_name": "",
        "description": "Add project description here.",
        "info": {
          "task_presenter": ""
        }
    })

def create_remote_project(profile, project):
    """
    This functions enqueues the worker with the primary keys for profile
    and project as it would be unwise to pickle and unpickle Django
    models for later use.
    """
    # Note: If for some reason the profile or project records disappear
    # by the time the worker runs, then we WANT the worker to fail.
    create_remote_project_worker.delay(profile.id, project.id)

@django_rq.job('default', timeout=60, result_ttl=24*3600)
def create_remote_project_worker(profile_id, project_id):
    profile = UserProfile.objects.get(pk=profile_id)
    url = urljoin(profile.pybossa_url, "/api/project")
    params = {'api_key': profile.pybossa_api_key}

    project = Project.objects.get(pk=project_id)
    payload = get_empty_project()
    payload.name = project.name
    payload.short_name = project.short_name
    bundlePath = getPresenterPath(project.task_type)
    payload.info['task_presenter'] = getPresenter(bundlePath)
    payload = pbclient._forbidden_attributes(payload)

    headers = {'content-type': 'application/json'}
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
    # ha, Pybossa spits back our multi-megabyte task_presenter at us.
    # delete the task_presenter from the result so it isn't logged by Python-RQ
    result['info']['task_presenter'] = ""
    return result

def delete_remote_project(profile, project):
    delete_remote_project_worker.delay(profile.id, project.id)

@django_rq.job('default', timeout=60, result_ttl=24*3600)
def delete_remote_project_worker(profile_id, project_id):
    profile = UserProfile.objects.get(pk=profile_id)
    project = Project.objects.get(pk=project_id)
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

def getPresenterPath(task_type):
    if task_type == "HLTR":
        return settings.HIGHLIGHTER_BUNDLE_JS
    elif task_type == "QUIZ":
        return settings.QUIZ_BUNDLE_JS
    else:
        raise InvalidTaskType("Project task type must be 'HLTR' or 'QUIZ'")

def getPresenter(bundlePath):
    if os.path.isfile(bundlePath):
        with open(bundlePath) as f:
            js = f.read()
        return "<script>\n%s\n</script>" % js
    else:
        raise FileNotFound("Task Presenter bundle.js not found: %s" % (bundlePath))

# Use our default user and projects to exercise the API.
def createRemoteProjects():
    researchers = init_defaults.createThresherGroup()
    profile = init_defaults.createNick(groups=[researchers])

    hproject = init_defaults.createHighlighterProject()
    create_remote_project(profile, hproject)

    qproject = init_defaults.createQuizProject()
    create_remote_project(profile, qproject)

def deleteRemoteProjects():
    researchers = init_defaults.createThresherGroup()
    profile = init_defaults.createNick(groups=[researchers])
    hproject = init_defaults.createHighlighterProject()
    delete_remote_project(profile, hproject)
    qproject = init_defaults.createQuizProject()
    delete_remote_project(profile, qproject)


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
