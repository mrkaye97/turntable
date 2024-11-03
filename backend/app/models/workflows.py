import datetime
import hashlib
import json
import os
import queue
import uuid

from celery import current_app
from celery.result import AsyncResult
from croniter import croniter
from django.contrib.postgres.fields import ArrayField
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.utils import timezone
from django_celery_beat.models import ClockedSchedule, CrontabSchedule, PeriodicTask
from polymorphic.models import PolymorphicModel

from app.models.git_connections import Branch
from app.models.resources import DBTResource, Resource
from app.models.workspace import Workspace
from app.workflows.metadata import sync_metadata
from app.workflows.orchestration import run_dbt_commands
from app.workflows.tests.utils import TEST_QUEUE

WORKFLOW_STARTED_QUEUE = queue.Queue()


class WorkflowType(models.TextChoices):
    CRON = "cron", "Cron"
    ONE_TIME = "one_time", "One Time"


class WorkflowTaskMap:
    map: dict[str, list[str]] = {}
    inverse_map: dict[str, str] = {}


class ScheduledWorkflow(PolymorphicModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    workflow_type = models.CharField(
        choices=WorkflowType.choices, max_length=255, editable=False
    )
    one_off = models.BooleanField(null=True)

    # relationships
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE)
    clocked = models.ForeignKey(ClockedSchedule, on_delete=models.CASCADE, null=True)
    crontab = models.ForeignKey(CrontabSchedule, on_delete=models.CASCADE, null=True)
    periodic_task = models.ForeignKey(PeriodicTask, on_delete=models.CASCADE, null=True)

    # derived fields
    replacement_identifier = models.CharField(
        max_length=64,
        editable=False,
        db_comment="The identifier of the periodic task that determines whether a new workflow should be created or an existing workflow should be updated",
    )
    aggregation_identifier = models.CharField(
        max_length=64,
        editable=False,
        db_comment="The identifier of the periodic task that determines which other workflows this should be aggregated with in the frontend",
    )

    def clean(self):
        if (self.clocked is None) == (self.crontab is None):
            raise ValidationError("Exactly one of clocked and crontab must be set")
        if not self.workflow_type:
            self.workflow_type = (
                WorkflowType.ONE_TIME if self.clocked else WorkflowType.CRON
            )
        elif self.workflow_type == WorkflowType.CRON and self.crontab is None:
            raise ValidationError("Crontab must be set for cron workflows")
        elif self.workflow_type == WorkflowType.ONE_TIME and self.clocked is None:
            raise ValidationError("Clocked must be set for one-time workflows")
        if self.one_off is None:
            self.one_off = self.workflow_type == WorkflowType.ONE_TIME
        if not self.one_off and self.clocked is not None:
            raise ValidationError("Clocked workflows cannot have one_off set to False")

    @property
    def workflow(self):
        raise NotImplementedError

    @property
    def kwargs(self):
        return {}

    def get_aggregation_identifier_dict(self):
        return {
            "TURNTABLE_SCHEDULED_WORKFLOW_NAME_***": self.workflow.name,
            "TURNTABLE_WORKFLOW_WORKSPACE_***": self.workspace.id,
            **self.kwargs,
        }

    def get_replacement_identifier_dict(self):
        return {
            "TURNTABLE_WORKFLOW_TYPE_***": self.workflow_type,
            "TURNTABLE_WORKFLOW_ONE_OFF_***": self.one_off,
            **self.get_aggregation_identifier_dict(),
        }

    def get_identifiers(self):
        for identifier_dict in [
            self.get_replacement_identifier_dict(),
            self.get_aggregation_identifier_dict(),
        ]:
            identifier = hashlib.sha256(
                json.dumps(identifier_dict).encode()
            ).hexdigest()
            yield identifier

    def get_upcoming_tasks(self, n: int = 10):
        if self.workflow_type == WorkflowType.ONE_TIME:
            diff = self.clocked.clocked_time - timezone.now()
            return [diff.total_seconds()]
        cron_expression_list = [
            str(self.crontab.minute),
            str(self.crontab.hour),
            str(self.crontab.day_of_week),
            str(self.crontab.day_of_month),
            str(self.crontab.month_of_year),
        ]
        cron_expression = " ".join(cron_expression_list)
        now = datetime.now(self.crontab.timezone)
        results = []
        for _ in range(n):
            cron = croniter(cron_expression, now)
            next_time = cron.get_next(now)
            results.append(max(0, (next_time - now).total_seconds()))
            now = next_time
        return results

    def get_periodic_task_args(self):
        return {
            "name": self.replacement_identifier,
            "task": self.workflow.name,
            "kwargs": json.dumps(self.kwargs),
            "one_off": self.one_off,
            "clocked_id": self.clocked.id if self.clocked else None,
            "crontab_id": self.crontab.id if self.crontab else None,
        }

    def save(self, *args, **kwargs):
        SUPER_ONLY = "TURNTABLE_SUPER_ONLY"
        if SUPER_ONLY in kwargs:
            del kwargs[SUPER_ONLY]
            super().save(*args, **kwargs)
            return

        self.clean()
        self.aggregation_identifier, self.replacement_identifier = (
            self.get_identifiers()
        )
        if not self.workflow_type:
            self.workflow_type = (
                WorkflowType.ONE_TIME if self.clocked else WorkflowType.CRON
            )

        # update the corresponding periodic tasks
        try:
            PeriodicTask.objects.get(name=self.replacement_identifier).delete()
        except PeriodicTask.DoesNotExist:
            pass
        self.periodic_task = PeriodicTask.objects.create(
            **self.get_periodic_task_args()
        )
        # Update any existing entries with the same identifier
        try:
            cur_entry = ScheduledWorkflow.objects.get(
                replacement_identifier=self.replacement_identifier
            )
            # avoid infine recursion
            adj_kwargs = {**kwargs, SUPER_ONLY: True}
            cur_entry.save(**adj_kwargs)
        except ScheduledWorkflow.DoesNotExist:
            pass

        # if testing, schedule the task immediately
        if os.getenv("BYPASS_CELERY_BEAT") == "true":
            next_delays = self.get_upcoming_tasks(10)
            for next_delay in next_delays:
                task_id = (
                    self.workflow.si(**self.kwargs)
                    .apply_async(countdown=next_delay, queue=TEST_QUEUE)
                    .id
                )
                WorkflowTaskMap.map.setdefault(self.id, []).append(task_id)
                WorkflowTaskMap.inverse_map[task_id] = self.id

        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # delete the periodic task
        PeriodicTask.objects.filter(
            name=self.replacement_identifier,
        ).delete()

        # if testing, delete the queued tasks
        if os.getenv("BYPASS_CELERY_BEAT") == "true":
            for task_id in WorkflowTaskMap.map[self.id]:
                current_app.control.revoke(task_id, terminate=False)
                WorkflowTaskMap.inverse_map.pop(task_id)
            WorkflowTaskMap.map.pop(self.id)

        super().delete(*args, **kwargs)

    def await_next_id(self, timeout: int | None = None):
        while True:
            try:
                item = WORKFLOW_STARTED_QUEUE.get(block=True, timeout=timeout)
            except queue.Empty:
                raise TimeoutError("Workflow did not start in time")
            if item["periodic_task_name"] == self.replacement_identifier:
                task_id = item["task_id"]
                break
        return task_id

    def await_next_result(
        self, start_timeout: int | None = None, duration_timeout: int | None = None
    ):
        task_id = self.await_next_id(start_timeout)
        result = AsyncResult(task_id)
        return result.get(timeout=duration_timeout)

    @classmethod
    @transaction.atomic
    def schedule_now(cls, *args, **kwargs):
        now = timezone.now()
        clocked = ClockedSchedule.objects.create(clocked_time=now)
        out = cls(*args, clocked=clocked, **kwargs)
        out.save()
        return out


class MetadataSyncWorkflow(ScheduledWorkflow):
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE)

    @property
    def workflow(self):
        return sync_metadata

    @property
    def kwargs(self):
        return {
            "workspace_id": str(self.workspace.id),
            "resource_id": str(self.resource.id),
        }


class DBTOrchestrator(ScheduledWorkflow):
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE)
    dbt_resource = models.ForeignKey(
        DBTResource, on_delete=models.CASCADE, related_name="dbt_orchestrator"
    )
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, null=True)
    commands = ArrayField(models.TextField())

    @property
    def workflow(self):
        return run_dbt_commands

    @property
    def kwargs(self):
        return {
            "workspace_id": str(self.workspace.id),
            "resource_id": str(self.resource.id),
            "dbt_resource_id": str(self.dbt_resource.id),
            "commands": self.commands,
            "branch_id": str(self.branch.id) if self.branch else None,
        }
