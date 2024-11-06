# Generated by Django 5.0.6 on 2024-11-04 22:08

import django.contrib.postgres.fields
import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("app", "0020_metabasedetails_add_api_key_and_more"),
        ("contenttypes", "0002_remove_content_type_name"),
        ("django_celery_beat", "0019_alter_periodictasks_options"),
        ("django_celery_results", "0011_taskresult_periodic_task_name"),
    ]

    operations = [
        migrations.CreateModel(
            name="ScheduledWorkflow",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4, primary_key=True, serialize=False
                    ),
                ),
                (
                    "workflow_type",
                    models.CharField(
                        choices=[("cron", "Cron"), ("one_time", "One Time")],
                        editable=False,
                        max_length=255,
                    ),
                ),
                ("one_off", models.BooleanField(null=True)),
                (
                    "replacement_identifier",
                    models.CharField(
                        db_comment="The identifier of the periodic task that determines whether a new workflow should be created or an existing workflow should be updated",
                        editable=False,
                        max_length=64,
                    ),
                ),
                (
                    "aggregation_identifier",
                    models.CharField(
                        db_comment="The identifier of the periodic task that determines which other workflows this should be aggregated with in the frontend",
                        editable=False,
                        max_length=64,
                    ),
                ),
                (
                    "clocked",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="django_celery_beat.clockedschedule",
                    ),
                ),
                (
                    "crontab",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="django_celery_beat.crontabschedule",
                    ),
                ),
                (
                    "periodic_task",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="django_celery_beat.periodictask",
                    ),
                ),
                (
                    "polymorphic_ctype",
                    models.ForeignKey(
                        editable=False,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="polymorphic_%(app_label)s.%(class)s_set+",
                        to="contenttypes.contenttype",
                    ),
                ),
                (
                    "workspace",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="app.workspace"
                    ),
                ),
            ],
            options={
                "abstract": False,
                "base_manager_name": "objects",
            },
        ),
        migrations.RemoveField(
            model_name="ingesterror",
            name="workflow_run",
        ),
        migrations.AddField(
            model_name="ingesterror",
            name="task",
            field=models.ForeignKey(
                db_column="task_id",
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="ingest_errors",
                to="django_celery_results.taskresult",
                to_field="task_id",
            ),
        ),
        migrations.CreateModel(
            name="DBTOrchestrator",
            fields=[
                (
                    "scheduledworkflow_ptr",
                    models.OneToOneField(
                        auto_created=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        parent_link=True,
                        primary_key=True,
                        serialize=False,
                        to="app.scheduledworkflow",
                    ),
                ),
                (
                    "commands",
                    django.contrib.postgres.fields.ArrayField(
                        base_field=models.TextField(), size=None
                    ),
                ),
                (
                    "branch",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="app.branch",
                    ),
                ),
                (
                    "dbt_resource",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="dbt_orchestrator",
                        to="app.dbtresource",
                    ),
                ),
                (
                    "resource",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="app.resource"
                    ),
                ),
            ],
            options={
                "abstract": False,
                "base_manager_name": "objects",
            },
            bases=("app.scheduledworkflow",),
        ),
        migrations.CreateModel(
            name="MetadataSyncWorkflow",
            fields=[
                (
                    "scheduledworkflow_ptr",
                    models.OneToOneField(
                        auto_created=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        parent_link=True,
                        primary_key=True,
                        serialize=False,
                        to="app.scheduledworkflow",
                    ),
                ),
                (
                    "resource",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="app.resource"
                    ),
                ),
            ],
            options={
                "abstract": False,
                "base_manager_name": "objects",
            },
            bases=("app.scheduledworkflow",),
        ),
        migrations.DeleteModel(
            name="WorkflowRun",
        ),
    ]
