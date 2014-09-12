import argparse
import json
import os

os.environ['DJANGO_SETTINGS_MODULE'] = 'thresher_backend.settings'
from django.conf import settings

from django.core.management import call_command
from django.core.management.color import no_style
from django.core.management.sql import sql_delete
from django.db import connections, DEFAULT_DB_ALIAS, models
from django.db.utils import IntegrityError

from data.parse_document import parse_document
from data.parse_schema import parse_schema
from thresher.models import Article, AnalysisType, TUA

ANALYSIS_TYPES = {}
HIGH_ID = 20000

def load_schema(schema):
    schema_name = schema['title']
    schema_obj = AnalysisType(
        name=schema_name,
        requires_processing=schema_name not in ['Useless', 'Future'],
        instructions=schema['instructions'],
        glossary=schema['glossary'],
        topics=schema['topics'], # Probably need to process this more.
    )
    try:
        schema_obj.save()
    except IntegrityError:
        # we've already loaded this schema, pull it into memory.
        print "Schema already exists, loading it into memory..."
        schema_obj = AnalysisType.objects.get(name=schema_name)

    ANALYSIS_TYPES[schema_name] = schema_obj
    print "loading schema..."

def load_article(article):
    new_id = int(article['metadata']['article_id'])

    try: # Catch duplicate article ids and assign new ids.
        existing_article = Article.objects.get(article_id=new_id)
        if article['text'] != existing_article.text:
            max_id = Article.objects.all().order_by('-article_id')[0].article_id
            new_id = max_id + 1 if max_id >= HIGH_ID else HIGH_ID
            print "NEW ID!", new_id
        else:
            # we've already loaded this article, so don't process its TUAs.
            return

    except Article.DoesNotExist: # Not a duplicate.
        pass

    article_obj = Article(
        article_id=new_id,
        text=article['text'],
        date_published=article['metadata']['date_published'],
        city_published=article['metadata']['city'],
        state_published=article['metadata']['state'],
        periodical=article['metadata']['periodical'],
        periodical_code=int(article['metadata']['periodical_code']),
        parse_version=article['metadata']['version'],
        annotators=json.dumps(article['metadata']['annotators']),
    )
    article_obj.save()

    for tua_type, tuas in article['tuas'].iteritems():
        if tua_type != 'Protester': continue # TODO: REMOVE ME
        for tua_id, offset_list in tuas.iteritems():
            try:
                tua_obj = TUA(
                    analysis_type=(ANALYSIS_TYPES.get(tua_type) or
                                   AnalysisType.objects.get(name=tua_type)),
                    article=article_obj,
                    offsets=json.dumps(offset_list), # Probably need to process this more.
                    tua_id=tua_id,
                )
            except AnalysisType.DoesNotExist:
                raise ValueError("No TUA type '" + tua_type +
                                 "' registered. Have you loaded the schemas?")
            try:
                tua_obj.save()
            except IntegrityError as e:
                import pdb;pdb.set_trace()
                print "error!"

    print "loading article..."

def load_schema_dir(dirpath):
    for schema_file in os.listdir(dirpath):
        if os.path.splitext(schema_file)[1] != '.txt':
            continue
        load_schema(parse_schema(os.path.join(dirpath, schema_file)))

def load_article_dir(dirpath):
    for article_file in os.listdir(dirpath):
        if os.path.splitext(article_file)[1] != '.txt':
            continue
        load_article(parse_document(os.path.join(dirpath, article_file)))

def load_args():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '-s', '--schema-dir',
        help='The directory holding raw schema files for the TUA types')
    parser.add_argument(
        '-d', '--article-dir',
        help='The directory holding raw article files for the TUA types')
    parser.add_argument(
        '-r', '--reset-db',
        action='store_true',
        default=False,
        help='Reset the database before loading data?')
    return parser.parse_args()

if __name__ == '__main__':
    args = load_args()
    if args.reset_db:
        conn = connections[DEFAULT_DB_ALIAS]

        # generate sql to delete all app tables
        reset_sql = '\n'.join(
            sql_delete(models.get_app('thresher'), no_style(), conn))
        print "Resetting DB..."
        print reset_sql

        # execute the sql in a transaction
        # TODO: TRANSACTION
        conn.cursor().execute(reset_sql)

        # run syncdb to recreate tables/indexes
        call_command('syncdb')
    if args.schema_dir:
        load_schema_dir(args.schema_dir)
    if args.article_dir:
        load_article_dir(args.article_dir)
