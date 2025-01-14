import time

import pytest
from django_celery_results.models import TaskResult

from app.models import (
    Resource,
)
from app.models.workflows import MetadataSyncWorkflow
from app.utils.test_utils import assert_ingest_output, require_env_vars
from app.workflows.metadata import process_metadata


def run_test_sync(
    resources,
    recache: bool,
    use_cache: bool = False,
    db_read_path: str | None = None,
    produce_columns: bool = False,
    produce_column_links: bool = False,
):
    # ensure the resources are ready
    time.sleep(1)

    for resource in resources:
        resource_id_str = str(resource.id)
        if use_cache:
            db_read_path_it = (
                (f"fixtures/datahub_dbs/{resource.details.subtype}.duckdb")
                if db_read_path is None
                else db_read_path
            )
            with open(db_read_path_it, "rb") as f:
                resource.datahub_db.save(db_read_path_it, f, save=True)
            task = process_metadata.si(
                workspace_id=str(resource.workspace_id), resource_id=resource_id_str
            ).apply_async()
            task.get()
            task_id = task.id
            periodic_task_name = None
            task_result = TaskResult.objects.get(task_id=task_id)
        else:
            workflow = MetadataSyncWorkflow.schedule_now(
                resource=resource,
                workspace=resource.workspace,
            )
            workflow.await_next_result()
            periodic_task_name = workflow.replacement_identifier
            task_result = (
                TaskResult.objects.filter(periodic_task_name=periodic_task_name)
                .order_by("-date_done")
                .first()
            )
        assert task_result.status == "SUCCESS"
        assert task_result.periodic_task_name == periodic_task_name
    assert_ingest_output(resources, produce_columns, produce_column_links)

    # recache datahub_dbs if successful and arg is passed
    if recache:
        for resource in Resource.objects.all():
            if resource.id in [r.id for r in resources]:
                with resource.datahub_db.open("rb") as f:
                    db_save_path = (
                        f"fixtures/datahub_dbs/{resource.details.subtype}.duckdb"
                    )
                    with open(db_save_path, "wb") as f2:
                        f2.write(f.read())


@pytest.mark.django_db(transaction=True)
@pytest.mark.usefixtures("custom_celery")
class TestMetadataSync:
    @pytest.mark.parametrize("use_cache", [True, False])
    def test_metadata_sync_postgres(
        self,
        local_metabase,
        local_postgres,
        recache: bool,
        use_cache: bool,
    ):
        resources = [local_metabase, local_postgres]
        run_test_sync(resources, recache, use_cache)
        assert_ingest_output(resources)

    @require_env_vars("BIGQUERY_0_WORKSPACE_ID")
    def test_metadata_sync_bigquery(
        self, remote_bigquery, recache: bool, use_cache: bool
    ):
        run_test_sync([remote_bigquery], recache, use_cache)

    @require_env_vars("DATABRICKS_0_WORKSPACE_ID")
    def test_metadata_sync_databricks(
        self, remote_databricks, recache: bool, use_cache: bool
    ):
        run_test_sync([remote_databricks], recache, use_cache)

    @require_env_vars("REDSHIFT_0_WORKSPACE_ID")
    def test_metadata_sync_redshift(
        self, remote_redshift, recache: bool, use_cache: bool
    ):
        run_test_sync([remote_redshift], recache, use_cache)

    @require_env_vars("TABLEAU_0_USERNAME")
    def test_metadata_sync_tableau(
        self, remote_tableau, recache: bool, use_cache: bool
    ):
        run_test_sync([remote_tableau], recache, use_cache)

    @require_env_vars("POWERBI_0_RESOURCE_NAME")
    def test_metadata_sync_powerbi(
        self, remote_powerbi, recache: bool, use_cache: bool
    ):
        run_test_sync(
            [remote_powerbi],
            recache,
            use_cache,
            produce_columns=False,
            produce_column_links=False,
        )


# if __name__ == "__main__":
#     import os

#     from fixtures.local_env import (
#         create_local_postgres,
#         create_local_user,
#         create_local_workspace,
#         create_repository_n,
#         create_ssh_key_n,
#     )

#     def user():
#         return create_local_user()

#     def workspace(user):
#         return create_local_workspace(user)

#     def local_postgres(workspace):
#         git_repo = None
#         if os.getenv("SSHKEY_0_PUBLIC") and os.getenv("SSHKEY_0_PRIVATE"):
#             ssh_key = create_ssh_key_n(workspace, 0)
#             git_repo = create_repository_n(workspace, 0, ssh_key)
#         return create_local_postgres(workspace, git_repo)

#     run_test_sync([local_postgres(workspace(user()))], recache=False)
