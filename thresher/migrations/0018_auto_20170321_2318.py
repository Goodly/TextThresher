# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-21 23:18
from __future__ import unicode_literals

import django.contrib.postgres.fields.jsonb
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('thresher', '0017_nlphints'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='articlehighlight',
            name='created_by',
        ),
        migrations.AddField(
            model_name='articlehighlight',
            name='info',
            field=django.contrib.postgres.fields.jsonb.JSONField(null=True),
        ),
        migrations.AddField(
            model_name='articlehighlight',
            name='pybossa_user_id',
            field=models.IntegerField(null=True),
        ),
    ]
