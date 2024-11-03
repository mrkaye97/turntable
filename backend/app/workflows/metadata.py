import tempfile

from celery import shared_task

from app.core.e2e import DataHubDBParser
from app.models import Resource, ResourceSubtype


@shared_task
def prepare_dbt_repos(workspace_id: str, resource_id: str):
    resource = Resource.objects.get(id=resource_id)
    for dbt_repo in resource.dbtresource_set.all():
        if dbt_repo.subtype == ResourceSubtype.DBT:
            dbt_repo.upload_artifacts()


@shared_task
def ingest_metadata(
    workspace_id: str, resource_id: str, workunits: int, workflow_run_id: str
):
    resource = Resource.objects.get(id=resource_id)
    resource.details.run_datahub_ingest(
        workflow_run_id=workflow_run_id, workunits=workunits
    )


@shared_task
def process_metadata(workspace_id: str, resource_id: str):
    resource = Resource.objects.get(id=resource_id)
    with resource.datahub_db.open("rb") as f:
        with tempfile.NamedTemporaryFile("wb", delete=False, suffix=".duckdb") as f2:
            f2.write(f.read())
            parser = DataHubDBParser(resource, f2.name)
            parser.parse()

    DataHubDBParser.combine_and_upload([parser], resource)


@shared_task
def sync_metadata(workspace_id: str, resource_id: str):
    prepare_dbt_repos(workspace_id=workspace_id, resource_id=resource_id)
    ingest_metadata(
        workspace_id=workspace_id,
        resource_id=resource_id,
        workunits=1000,
        workflow_run_id="0",
    )
    process_metadata(workspace_id=workspace_id, resource_id=resource_id)
