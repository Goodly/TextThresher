import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "thresher_backend.settings")
import django
django.setup()
from django.db import connection
from django.conf import settings
from django.db import transaction

import logging
logger = logging.getLogger(__name__)

import json
from itertools import groupby
import requests
from requests.compat import urljoin
import iso8601
import django_rq

from thresher.models import Article, Topic, Project, UserProfile, Task
from thresher.models import ArticleHighlight, HighlightGroup
from thresher.views import collectHighlightTasks, collectQuizTasks
from data import init_defaults

class InvalidTaskType(Exception):
    pass

class FileNotFound(Exception):
    pass

class ImproperConfigForRemote(Exception):
    pass

class InvalidTaskRun(Exception):
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

@django_rq.job('task_exporter', timeout=60, result_ttl=24*3600)
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
        raise ImproperConfigForRemote(resp.text)
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
        return result
    else:
        # our large task_presenter is embedded in the exception_msg,
        # so truncate the message
        result['exception_msg'] = result['exception_msg'][:256]
        raise ImproperConfigForRemote(json.dumps(result))

def delete_remote_project(profile, project):
    """
    This functions enqueues the worker to delete a project on a remote
    Pybossa server.
    """
    return delete_remote_project_worker.delay(profile_id=profile.id,
                                              project_id=project.id)

@django_rq.job('task_exporter', timeout=60, result_ttl=24*3600)
def delete_remote_project_worker(profile_id=None, project_id=None):
    profile = UserProfile.objects.get(pk=profile_id)
    project = Project.objects.get(pk=project_id)
    headers = {'content-type': 'application/json'}
    url = urljoin(project.pybossa_url, "/api/project/%d" % (project.pybossa_id))
    if not project.pybossa_url or not project.pybossa_id:
        raise ImproperConfigForRemote("While trying to delete %s, only have %s"
                                      % (project.short_name, url))
    params = {'api_key': profile.pybossa_api_key }
    resp = requests.delete(url, params=params, headers=headers, timeout=30)
    if resp.status_code / 100 == 2:
        project.pybossa_url = ""
        project.pybossa_id = None
        project.pybossa_owner_id = None
        project.pybossa_secret_key = ""
        project.pybossa_created = None
        project.save()
        # Pybossa cascade deletes tasks and taskruns on the server
        # Keep all of our local copies of those items intact, namely,
        # Task, ArticleHighlight, HighlightGroup
        # n.b. Pybossa returns no body on success.
        return True

    # Pybossa returns JSON if DELETE has error.
    raise ImproperConfigForRemote(resp.text)

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

@django_rq.job('task_exporter', timeout=60, result_ttl=24*3600)
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

@django_rq.job('task_exporter', timeout=60, result_ttl=24*3600)
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

@django_rq.job('task_exporter', timeout=60, result_ttl=24*3600)
def create_remote_task_worker(profile_id=None, project_id=None, task=None, n_answers=1):
    profile = UserProfile.objects.get(pk=profile_id)
    project = Project.objects.get(pk=project_id)

    params = {'api_key': profile.pybossa_api_key}
    url = urljoin(project.pybossa_url, "/api/task")

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
        # our task info was already logged by Python RQ as an incoming parameter
        result['info'] = ""
        return result
    else:
        # our large info item may be embedded in the exception_msg,
        # so truncate the message
        result['exception_msg'] = result['exception_msg'][:256]
        raise ImproperConfigForRemote(json.dumps(result))

def testGetHighlighterTaskRuns():
    profile_id = UserProfile.objects.get(user__username="nick").id
    project_id = Project.objects.get(name__exact="Deciding Force Highlighter").id
    generate_get_taskruns_worker.delay(profile_id=profile_id,
                                       project_id=project_id)


@django_rq.job('task_importer', timeout=60, result_ttl=24*3600)
def generate_get_taskruns_worker(profile_id=None, project_id=None):
    startCount = len(connection.queries)
    profile = UserProfile.objects.get(pk=profile_id)
    project = Project.objects.get(pk=project_id)
    if project.task_type == 'HLTR':
        save_taskrun = save_highlight_taskrun
    elif project.task_type == 'QUIZ':
        save_taskrun = save_quiz_taskrun
    else:
        raise InvalidTaskType("Project task type must be 'HLTR' or 'QUIZ'")
    tasks = Task.objects.filter(project=project)
    for task in tasks:
        get_remote_taskrun_worker.delay(profile_id=profile_id,
                                        project_id=project_id,
                                        task_id=task.id,
                                        save_taskrun=save_taskrun)
    return ({
        "task_type": project.task_type,
        "generatedTasks": len(tasks),
        "numberOfQueries": len(connection.queries) - startCount
    })

@django_rq.job('task_importer', timeout=60, result_ttl=24*3600)
def get_remote_taskrun_worker(profile_id=None, project_id=None, task_id=None, save_taskrun=None):
    profile = UserProfile.objects.get(pk=profile_id)
    project = Project.objects.get(pk=project_id)
    task = Task.objects.get(pk=task_id)

    # Request the task, with the query parameter related=True to include
    # the task_runs for this task.
    params = {'api_key': profile.pybossa_api_key,
              'related': 'True'}
    url = urljoin(project.pybossa_url, '/api/task/%d' % (task.pybossa_id))
    headers = {'content-type': 'application/json'}
    resp = requests.get(url, params=params,
                        headers=headers, timeout=30)
    pybossa_task = resp.json()
    if resp.status_code / 100 == 2:
        taskruns = pybossa_task['task_runs']
        count = 0
        for taskrun in taskruns:
            if save_taskrun(task, taskrun):
                count += 1
        return {
            'taskruns_imported': count,
            'taskruns_skipped': len(taskruns)-count
        }

    raise ImproperConfigForRemote(resp.text[:1024])

def save_highlight_taskrun(task, taskrun):
    # If an exception occurs loading HighlightGroups, roll back everything
    with transaction.atomic():
        taskrun_id = taskrun['id']
        if ArticleHighlight.objects.filter(pybossa_id=taskrun_id).count():
            # Previously saved this taskrun
            return None
        ah = ArticleHighlight.objects.create(
            task=task, # safe - from our database, not Pybossa
            article_id=task.info['article']['id'], # safe - from our database
            pybossa_user_id=taskrun['user_id'],
            pybossa_id=taskrun_id,
            highlight_source=task.task_type,
            info=taskrun
        )

        valid_topics_for_task = [ topic['id'] for topic in task.info['topics'] ]
        highlights = taskrun['info']
        # See thresher.views.collectQuizTasksForTopic for export code
        # Our highlight_groups model allows us to aggregate a set
        # of highlights for a given article, topic, and case_number.
        # So let's aggregate accordingly.
        sortkey = lambda x: (x['topic'], x['caseNum'])
        hg_by_topic_case = sorted(highlights, key=sortkey)

        for (topic_id, case_number), hg in groupby(hg_by_topic_case, key=sortkey):
            # Verify this is a valid topic_id, since it is externally provided
            if topic_id not in valid_topics_for_task:
                raise InvalidTaskRun("Valid topic ids for task are %s, received %d" %
                                     (str(valid_topics_for_task), topic_id))
            hg_list = list(hg)
            offsets=[ [x['start'], x['end'], x['text']] for x in hg_list ]
            highlight_text=[ [x['text']] for x in hg_list ]
            HighlightGroup.objects.create(
                article_highlight=ah,
                topic_id=topic_id,
                case_number=case_number,
                highlight_text=json.dumps(highlight_text),
                offsets=json.dumps(offsets)
            )

        return ah

def save_quiz_taskrun(task, taskrun):
    with transaction.atomic():
        return False


if __name__ == '__main__':
    logger.info("Highlighter bundle: %s" % settings.HIGHLIGHTER_BUNDLE_JS)
    logger.info("Quiz bundle: %s" % settings.QUIZ_BUNDLE_JS)

    testCreateRemoteProjects()
    testCreateRemoteHighlighterTasks()
    testCreateRemoteQuizTasks()
