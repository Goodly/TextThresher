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
import iso8601
import django_rq

from thresher.models import Article, Topic, Project, UserProfile, Task
from thresher.views import collectHighlightTasks, collectQuizTasks
from data import init_defaults

class InvalidTaskType(Exception):
    pass

class FileNotFound(Exception):
    pass


def create_remote_project(profile, project):
    """
    This functions enqueues the worker to create a project on a remote
    Pybossa server.
    """
    # This enqueues the worker with the primary keys for profile
    # and project as it would be unwise to pickle and unpickle Django
    # models for later use.
    # Note: If for some reason the profile or project records disappear
    # by the time the worker runs, then we WANT the worker to fail.
    return create_remote_project_worker.delay(profile_id=profile.id, project_id=project.id)

@django_rq.job('default', timeout=60, result_ttl=24*3600)
def create_remote_project_worker(profile_id=None, project_id=None):
    profile = UserProfile.objects.get(pk=profile_id)
    url = urljoin(profile.pybossa_url, "/api/project")
    params = {'api_key': profile.pybossa_api_key}

    project = Project.objects.get(pk=project_id)
    bundlePath = getPresenterPath(project.task_type)
    payload = {
        "name": project.name,
        "short_name": project.short_name,
        "description": "Add project description here.",
        "info": {
          "task_presenter": getPresenter(bundlePath)
        }
    }
    headers = {'content-type': 'application/json'}
    resp = requests.post(url, params=params,
                         headers=headers, timeout=30,
                         json=payload)
    try:
        # If presenter > 5MB, Will get a 413 Request Entity Too Large
        # from NGINX as HTML which will cause json parser to throw ValueError
        result = resp.json()
    except ValueError:
        return resp.text # Return the response content for error analysis
    if resp.status_code / 100 == 2 and result.get('id'):
        # if Pybossa reports success, then we expect these fields to be present
        # save info about where this project can be found remotely
        project.pybossa_url = profile.pybossa_url
        project.pybossa_id = int(result.get('id'))
        project.pybossa_owner_id = int(result.get('owner_id'))
        project.pybossa_secret_key = result.get('secret_key', '')
        project.pybossa_created = iso8601.parse_date(result.get('created'))
        project.save()
        # delete our large task_presenter from the result so it isn't logged by Python-RQ
        result['info']['task_presenter'] = ""
    else:
        # our large task_presenter is embedded in the exception_msg,
        # so truncate the message
        result['exception_msg'] = result['exception_msg'][:256]
    return result

def delete_remote_project(profile, project):
    """
    This functions enqueues the worker to delete a project on a remote
    Pybossa server.
    """
    return delete_remote_project_worker.delay(profile_id=profile.id,
                                              project_id=project.id)

@django_rq.job('default', timeout=60, result_ttl=24*3600)
def delete_remote_project_worker(profile_id=None, project_id=None):
    profile = UserProfile.objects.get(pk=profile_id)
    project = Project.objects.get(pk=project_id)
    headers = {'content-type': 'application/json'}
    result = {
        "deleted": False,
        "short_name": project.short_name,
        "task_type": project.task_type,
        "url": project.getURL()
    }
    if not project.pybossa_id:
        result["deleted"] = False
        result["error"] = "No id for remote project."
        return result
    url = urljoin(profile.pybossa_url, "/api/project/%d" % (project.pybossa_id))
    params = {'api_key': profile.pybossa_api_key }
    resp = requests.delete(url, params=params, headers=headers, timeout=30)
    if resp.status_code / 100 == 2:
        result["deleted"] = True
        project.pybossa_url = ""
        project.pybossa_id = None
        project.pybossa_owner_id = None
        project.pybossa_secret_key = ""
        project.pybossa_created = None
        project.save()
        # Pybossa has cascade deleted any tasks on the server - get rid of
        # our references to those tasks
        project.tasks.all().delete()
    else:
        result = resp.json() # Pybossa only returns JSON if DELETE has error
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
def testCreateRemoteProjects():
    researchers = init_defaults.createThresherGroup()
    profile = init_defaults.createNick(groups=[researchers])

    hproject = init_defaults.createHighlighterProject()
    create_remote_project(profile, hproject)

    qproject = init_defaults.createQuizProject()
    create_remote_project(profile, qproject)

def testDeleteRemoteProjects():
    researchers = init_defaults.createThresherGroup()
    profile = init_defaults.createNick(groups=[researchers])

    hproject = init_defaults.createHighlighterProject()
    delete_remote_project(profile, hproject)

    qproject = init_defaults.createQuizProject()
    delete_remote_project(profile, qproject)

def testCreateRemoteHighlighterTasks():
    # Send primary keys through Django-RQ, not Models and Querysets
    profile_id = UserProfile.objects.get(user__username="nick").id
    article_ids = list(Article.objects.all().values_list('id', flat=True))
    topic_ids = list(Topic.objects.filter(parent=None)
                     .values_list('id', flat=True))
    project_id = Project.objects.get(name__exact="Deciding Force Highlighter").id
    generate_highlight_tasks_worker.delay(profile_id=profile_id,
                                          article_ids=article_ids,
                                          topic_ids=topic_ids,
                                          project_id=project_id)

@django_rq.job('default', timeout=60, result_ttl=24*3600)
def generate_highlight_tasks_worker(profile_id=None,
                                    article_ids=None,
                                    topic_ids=None,
                                    project_id=None,
                                    depends_on=None):
    startCount = len(connection.queries)
    articles = Article.objects.filter(id__in=article_ids)
    topics = Topic.objects.filter(id__in=topic_ids)
    project = Project.objects.get(pk=project_id)
    if not project.pybossa_id:
        return {"error_msg":  "Project '%s' must be created remotely "
                "before creating tasks for it." % (project.short_name)}
    if project.task_type != "HLTR":
        return {"error_msg": "Project type must be 'HLTR', "
                "found '%s'" % (project.task_type)}
    tasks = collectHighlightTasks(articles, topics, project)
    if settings.DEBUG:
        tasks = tasks[:5] # limit for debugging
    for task in tasks:
        create_remote_task_worker.delay(profile_id=profile_id,
                                        project_id=project_id,
                                        task=task,
                                        depends_on=depends_on)
    return ({
      "task_type": "HLTR",
      "generatedTasks": len(tasks),
      "numberOfQueries": len(connection.queries) - startCount
    })

def testCreateRemoteQuizTasks():
    # Send primary keys through Django-RQ, not Models
    profile_id = UserProfile.objects.get(user__username="nick").id
    article_ids = list(Article.objects.all().values_list('id', flat=True))
    topic_ids = list(Topic.objects.filter(parent=None)
                     .values_list('id', flat=True))
    project_id = Project.objects.get(name__exact="Deciding Force Quiz").id
    generate_quiz_tasks_worker.delay(profile_id=profile_id,
                                     article_ids=article_ids,
                                     topic_ids=topic_ids,
                                     project_id=project_id)

@django_rq.job('default', timeout=60, result_ttl=24*3600)
def generate_quiz_tasks_worker(profile_id=None,
                               article_ids=None,
                               topic_ids=None,
                               project_id=None,
                               depends_on=None):
    startCount = len(connection.queries)
    articles = Article.objects.filter(id__in=article_ids)
    topics = Topic.objects.filter(id__in=topic_ids)
    project = Project.objects.get(pk=project_id)
    if not project.pybossa_id:
        return {"error_msg":  "Project '%s' must be created remotely "
                "before creating tasks for it." % (project.short_name)}
    if project.task_type != "QUIZ":
        return {"error_msg": "Project type must be 'QUIZ', "
                "found '%s'" % (project.task_type)}
    tasks = collectQuizTasks(articles, topics, project)
    if settings.DEBUG:
        tasks = tasks[:5] # DEBUG
    for task in tasks:
        create_remote_task_worker.delay(profile_id=profile_id,
                                        project_id=project_id,
                                        task=task,
                                        depends_on=depends_on)
    return ({
      "task_type": "QUIZ",
      "generatedTasks": len(tasks),
      "numberOfQueries": len(connection.queries) - startCount
    })

@django_rq.job('default', timeout=60, result_ttl=24*3600)
def create_remote_task_worker(profile_id=None, project_id=None, task=None, n_answers=1):
    profile = UserProfile.objects.get(pk=profile_id)
    url = urljoin(profile.pybossa_url, "/api/task")
    params = {'api_key': profile.pybossa_api_key}

    project = Project.objects.get(pk=project_id)

    payload = {
        "project_id": project.pybossa_id,
        "info": task,
        "calibration": 0,
        "priority_0": 0.0,
        "n_answers": n_answers,
        "quorum": 0
    }

    headers = {'content-type': 'application/json'}
    resp = requests.post(url, params=params,
                         headers=headers, timeout=30,
                         json=payload)
    result = resp.json()
    if resp.status_code / 100 == 2 and result.get('id'):
        # if Pybossa reports success, then we expect these fields to be present
        Task(
            project_id = project_id,
            task_type = project.task_type,
            info = task,
            pybossa_id = int(result.get('id')),
            pybossa_project_id = int(result.get('project_id')),
            pybossa_created = iso8601.parse_date(result.get('created')),
            pybossa_state = result.get('state')
        ).save()
        # are task info was already logged by Python RQ as an incoming parameter
        result['info'] = ""
    else:
        # our large info item may be embedded in the exception_msg,
        # so truncate the message
        result['exception_msg'] = result['exception_msg'][:256]
    return result


if __name__ == '__main__':
    logger.info("Highlighter bundle: %s" % settings.HIGHLIGHTER_BUNDLE_JS)
    logger.info("Quiz bundle: %s" % settings.QUIZ_BUNDLE_JS)

    testCreateRemoteProjects()
    testCreateRemoteHighlighterTasks()
    testCreateRemoteQuizTasks()
