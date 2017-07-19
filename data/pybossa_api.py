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

from thresher.models import (Article, Topic, Project,
                             Task, Contributor,
                             ArticleHighlight, HighlightGroup)

from data.task_collector import collectHighlightTasks, collectQuizTasks
from data import init_defaults

class InvalidTaskType(Exception):
    pass

class FileNotFound(Exception):
    pass

class ImproperConfigForRemote(Exception):
    pass

class InvalidTaskRun(Exception):
    pass

@django_rq.job('task_exporter', timeout=60, result_ttl=24*3600)
def create_or_update_remote_project_worker(project_id,
                                           debug_presenter=False,
                                           debug_server=''):
    project = Project.objects.get(pk=project_id)

    url = urljoin(project.pybossa_url, "/api/project")
    params = {'api_key': project.pybossa_api_key}

    payload = {
        "name": project.name,
        "short_name": project.short_name,
        "description": project.description,
        "info": {
          "task_presenter": getPresenter(project.task_type,
                                         debug_presenter,
                                         debug_server)
        }
    }
    headers = {'content-type': 'application/json'}
    if not project.pybossa_id:
        # Create with POST
        resp = requests.post(url, params=params,
                             headers=headers, timeout=30,
                             json=payload)
    else:
        # Update with PUT
        url += "/%d" % project.pybossa_id
        resp = requests.put(url, params=params,
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

def delete_remote_project(project):
    """
    This functions enqueues the worker to delete a project on a remote
    Pybossa server.
    """
    return delete_remote_project_worker.delay(project_id=project.id)

@django_rq.job('task_exporter', timeout=60, result_ttl=24*3600)
def delete_remote_project_worker(project_id=None):
    project = Project.objects.get(pk=project_id)
    headers = {'content-type': 'application/json'}
    url = urljoin(project.pybossa_url, "/api/project/%d" % (project.pybossa_id))
    if not project.pybossa_url or not project.pybossa_id:
        raise ImproperConfigForRemote("While trying to delete %s, only have %s"
                                      % (project.short_name, url))
    params = {'api_key': project.pybossa_api_key }
    resp = requests.delete(url, params=params, headers=headers, timeout=30)
    if resp.status_code / 100 == 2:
        project.pybossa_url = ""
        project.pybossa_id = None
        project.pybossa_owner_id = None
        project.pybossa_secret_key = ""
        project.pybossa_created = None
        project.save()
        # Pybossa cascade deletes tasks on the server, but won't delete
        # a project with taskruns.
        # Keep all of our local copies of those items intact, namely,
        # Task, ArticleHighlight, HighlightGroup
        # n.b. Pybossa returns no body on success.
        return True

    # Pybossa returns JSON if DELETE has error.
    raise ImproperConfigForRemote(resp.text)

def getPresenter(task_type, debug_presenter=False, debug_server=''):
    if task_type == "HLTR":
        bundle_path = settings.HIGHLIGHTER_BUNDLE_JS
        url_path = settings.HIGHLIGHTER_BUNDLE_URLPATH
    elif task_type == "QUIZ":
        bundle_path =  settings.QUIZ_BUNDLE_JS
        url_path = settings.QUIZ_BUNDLE_URLPATH
    else:
        raise InvalidTaskType("Project task type must be 'HLTR' or 'QUIZ'")

    if debug_presenter:
        url = urljoin(debug_server, url_path)
        return '<script type="text/javascript" src="%s"></script>' % url
    else:
        if os.path.isfile(bundle_path):
            with open(bundle_path) as f:
                js = f.read()
            return '<script>\n%s\n</script>' % js
        else:
            raise FileNotFound("Task Presenter bundle.js not found: %s" % (bundle_path))

@django_rq.job('task_exporter', timeout=60, result_ttl=24*3600)
def generate_tasks_worker(project_id=None,
                          article_ids=None,
                          topic_ids=None,
                          depends_on=None):
    startCount = len(connection.queries)
    project = Project.objects.get(pk=project_id)
    if not project.pybossa_id:
        return {"error_msg":  "Project '%s' must be created remotely "
                "before creating tasks for it." % (project.short_name)}

    articles = Article.objects.filter(id__in=article_ids)
    topics = Topic.objects.filter(id__in=topic_ids)
    if project.task_type == 'HLTR':
        tasks = collectHighlightTasks(articles, topics, project)
    elif project.task_type == 'QUIZ':
        tasks = collectQuizTasks(articles, topics, project)
    else:
        raise InvalidTaskType("Project task type must be 'HLTR' or 'QUIZ'")

    for task in tasks:
        create_remote_task_worker.delay(project_id=project_id,
                                        task=task,
                                        depends_on=depends_on)
    return ({
      "task_type": project.task_type,
      "generatedTasks": len(tasks),
      "numberOfQueries": len(connection.queries) - startCount
    })

@django_rq.job('task_exporter', timeout=60, result_ttl=24*3600)
def create_remote_task_worker(project_id=None, task=None, n_answers=1):
    project = Project.objects.get(pk=project_id)

    params = {'api_key': project.pybossa_api_key}
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

@django_rq.job('task_importer', timeout=60, result_ttl=24*3600)
def generate_get_taskruns_worker(project_id=None):
    startCount = len(connection.queries)
    project = Project.objects.get(pk=project_id)
    if project.task_type == 'HLTR':
        save_taskrun = save_highlight_taskrun
    elif project.task_type == 'QUIZ':
        save_taskrun = save_quiz_taskrun
    else:
        raise InvalidTaskType("Project task type must be 'HLTR' or 'QUIZ'")
    tasks = Task.objects.filter(project=project)
    for task in tasks:
        get_remote_taskrun_worker.delay(project_id=project_id,
                                        task_id=task.id,
                                        save_taskrun=save_taskrun)
    return ({
        "task_type": project.task_type,
        "generatedTasks": len(tasks),
        "numberOfQueries": len(connection.queries) - startCount
    })

@django_rq.job('task_importer', timeout=60, result_ttl=24*3600)
def get_remote_taskrun_worker(project_id=None, task_id=None, save_taskrun=None):
    project = Project.objects.get(pk=project_id)
    task = Task.objects.get(pk=task_id)

    # Request the task, with the query parameter related=True to include
    # the task_runs for this task.
    params = {'api_key': project.pybossa_api_key,
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

        (contributor, created) = Contributor.objects.get_or_create(
            pybossa_user_id=taskrun['user_id'],
            defaults = {
              'accuracy_score': 0.0,
              'experience_score': 0.0
            }
        )

        ah = ArticleHighlight.objects.create(
            task=task, # safe - from our database, not Pybossa
            article_id=task.info['article']['id'], # safe - from our database
            contributor=contributor,
            pybossa_id=taskrun_id,
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
            HighlightGroup.objects.create(
                article_highlight=ah,
                topic_id=topic_id,
                case_number=case_number,
                offsets=offsets
            )

        return ah

def save_quiz_taskrun(task, taskrun):
    with transaction.atomic():
        return False
