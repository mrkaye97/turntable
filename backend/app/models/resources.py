import json
import os
import re
import shutil
import tempfile
import uuid
from contextlib import contextmanager
from typing import Any, Generator

import yaml
from django.contrib.postgres.fields import ArrayField
from django.core.exceptions import ValidationError
from django.core.files import File
from django.db import models
from django_celery_results.models import TaskResult
from polymorphic.models import PolymorphicModel

from app.models.git_connections import Repository
from app.models.workspace import Workspace
from app.utils.fields import encrypt
from vinyl.lib.connect import (
    BigQueryConnector,
    DatabaseFileConnector,
    DatabricksConnector,
    PostgresConnector,
    RedshiftConnector,
    SnowflakeConnector,
)
from vinyl.lib.dbt import DBTProject, DBTTransition
from vinyl.lib.dbt_methods import DBTDialect, DBTVersion
from vinyl.lib.utils.files import save_orjson
from vinyl.lib.utils.process import run_and_capture_subprocess


class WorkflowStatus(models.TextChoices):
    RUNNING = "RUNNING", "Running"
    FAILED = "FAILED", "Failed"
    SUCCESS = "SUCCESS", "Success"


# Helper classes
class ResourceType(models.TextChoices):
    DB = "db", "Database"
    BI = "bi", "BI Tool"


class ResourceSubtype(models.TextChoices):
    LOOKER = "looker", "Looker"
    TABLEAU = "tableau", "Tableau"
    METABASE = "metabase", "Metabase"
    POWERBI = "powerbi", "PowerBI"
    BIGQUERY = "bigquery", "BigQuery"
    SNOWFLAKE = "snowflake", "Snowflake"
    POSTGRES = "postgres", "Postgres"
    REDSHIFT = "redshift", "Redshift"
    DATABRICKS = "databricks", "Databricks"
    DUCKDB = "duckdb", "File"
    FILE = "file", "File"
    DBT = "dbt", "Dbt"
    DBT_CLOUD = "dbt_cloud", "Dbt Cloud"


# helper functions
def get_sync_config(db_path):
    return {
        "type": "datahub-lite",
        "config": {
            "type": "duckdb",
            "config": {"file": db_path},
        },
    }


@contextmanager
def repo_path(
    obj, isolate: bool = False, branch_id: str | None = None
) -> Generator[tuple[str, Repository | None], None, None]:
    repo: Repository | None = getattr(obj, "repository")
    project_path = getattr(obj, "project_path")
    if repo is None:
        if isolate or os.getenv("FORCE_ISOLATE") == "true":
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_project_path = os.path.join(
                    temp_dir, os.path.basename(project_path)
                )
                shutil.copytree(project_path, temp_project_path, dirs_exist_ok=True)
                yield temp_project_path, None
                return

        yield project_path, None
        return
    branch = repo.main_branch if branch_id is None else repo.get_branch(branch_id)
    with branch.repo_context(isolate=isolate) as (git_repo, _):
        project_path = os.path.join(git_repo.working_tree_dir, project_path)
        yield project_path, git_repo


class Resource(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace, on_delete=models.CASCADE, null=True, related_name="resources"
    )
    name = models.TextField(null=True)
    type = models.TextField(choices=ResourceType.choices, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    creator = models.ForeignKey(
        "User", on_delete=models.SET_NULL, null=True, default=None
    )
    datahub_db = models.FileField(upload_to="datahub_dbs/", null=True)

    class Meta:
        indexes = [
            models.Index(fields=["workspace_id"]),
        ]

    def _get_latest_sync_run(self, successes_only: bool = False):
        from app.models.workflows import MetadataSyncWorkflow

        most_recent = MetadataSyncWorkflow(
            resource_id=self.id, workspace_id=self.workspace.id
        ).most_recent(1, successes_only)
        return most_recent[0] if most_recent else None

    @property
    def status(self):
        run = self._get_latest_sync_run()
        return run.status if run else None

    @property
    def last_synced(self):
        run = self._get_latest_sync_run(successes_only=True)
        return run.date_done if run else None

    @property
    def subtype(self):
        return self.details.subtype

    @property
    def has_dbt(self):
        return self.dbtresource_set.exists()

    def get_dbt_resource(self, dbt_resource_id=None):
        if dbt_resource_id is None:
            dbt_resource_count = self.dbtresource_set.count()
            assert (
                dbt_resource_count == 1
            ), f"Expected 1 dbt resource, found {dbt_resource_count}"
            dbt_resource = self.dbtresource_set.first()
        else:
            dbt_resource = self.dbtresource_set.get(id=dbt_resource_id)
            assert (
                dbt_resource.resource.id == self.id
            ), f"Specified DBT resource does not belong to the resource {self.id}"
        assert (
            dbt_resource.subtype == ResourceSubtype.DBT
        ), "Expected DBT core resource. Currently, running dbt cloud resources is not supported."

        return dbt_resource


class IngestError(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(
        TaskResult,
        to_field="task_id",
        db_column="task_id",
        on_delete=models.CASCADE,
        null=True,
        related_name="ingest_errors",
    )
    command = models.TextField(null=True)
    error = models.JSONField(null=True)


class ResourceDetails(PolymorphicModel):
    name = models.CharField(max_length=255, blank=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, null=True)
    resource = models.OneToOneField(
        Resource, on_delete=models.CASCADE, null=True, related_name="details"
    )

    class Meta:
        indexes = [
            models.Index(fields=["resource_id"]),
        ]

    @property
    def datahub_extras(self) -> list[str]:
        pass

    @property
    def datahub_db_nickname(self) -> str:
        return self.datahub_extras[0] if self.datahub_extras else "datahub"

    @property
    def test_number_of_entries(self) -> int:
        return 3

    def db_config_paths(self, temp_dir: str):
        db_path = os.path.join(
            temp_dir, f"{self.resource.id}_{self.datahub_db_nickname}.duckdb"
        )
        config_path = os.path.join(
            temp_dir, f"{self.resource.id}_{self.datahub_db_nickname}.yml"
        )
        return db_path, config_path

    def _run_datahub_ingest_base(
        self,
        test: bool = False,
        workunits: int | None = None,
        tolerate_errors: bool = True,
    ):
        dh_packages = "acryl-datahub[datahub-lite"
        for extra in self.datahub_extras:
            dh_packages += f",{extra}"
        dh_packages += "]"

        # run ingest test
        log_pattern = re.compile(
            r"(?P<datetime>.+?)\s+(?P<level>\w+)\s+(?P<message>.+)"
        )
        errors = []
        with self.datahub_yaml_path() as (config_paths, db_path):
            for path in config_paths:
                if test and os.path.basename(path) == "dbt.yml":
                    # skip dbt config if testing
                    continue
                command = [
                    "uvx",
                    "--no-progress",
                    "--isolated",
                    "--from",
                    dh_packages,
                    "--with",
                    "spacy==3.7.5",  # hardcode spacy version to prevent docker build issues on arm linux
                    "datahub",
                ]
                with tempfile.NamedTemporaryFile(suffix=".log", mode="r+") as log_file:
                    command.extend(
                        [
                            "--log-file",
                            log_file.name,
                            "ingest",
                            "-c",
                            path,
                        ]
                    )
                    if workunits is not None:
                        command.extend(
                            [
                                "--preview",
                                "--preview-workunits",
                                str(workunits),
                            ]
                        )
                    process = run_and_capture_subprocess(command)
                    connection_type = os.path.basename(path).split(".")[0]
                    if process.returncode != 0:
                        errors.append(
                            {
                                "connection_type": connection_type,
                                "error_message": process.stderr,
                            }
                        )
                    log_contents = log_file.read()
                    for line in log_contents.splitlines():
                        match = log_pattern.match(line)
                        if match and match.group("level") == "ERROR":
                            errors.append(
                                {
                                    "connection_type": connection_type,
                                    "error_message": match.group("message"),
                                }
                            )
            if not test and (len(errors) == 0 or tolerate_errors):
                with open(db_path, "rb") as f:
                    self.resource.datahub_db.save(
                        os.path.basename(db_path), File(f), save=True
                    )
        if len(errors) > 0:
            return {"success": False, "command": command, "errors": errors}
        return {"success": True, "command": command}

    def run_datahub_ingest(
        self,
        task_id: str,
        workunits: int | None = None,
        tolerate_errors: bool = True,
    ):
        result = self._run_datahub_ingest_base(
            workunits=workunits, tolerate_errors=tolerate_errors
        )
        if not result["success"]:
            ingest_errors = [
                IngestError(
                    task_id=task_id,
                    command=result["command"],
                    error=error,
                )
                for error in result["errors"]
            ]
            IngestError.objects.bulk_create(ingest_errors)
            if not tolerate_errors:
                raise Exception(
                    {
                        "message": "Datahub ingest failed",
                        "command": result["command"],
                        "errors": result["errors"],
                    }
                )
        return result

    def test_datahub_connection(self):
        return self._run_datahub_ingest_base(
            test=True, workunits=self.test_number_of_entries
        )

    def test_db_connection(self):
        try:
            connector = self.get_connector()
            query = connector.run_query("SELECT 1")[0].iloc[0].iloc[0]
            if query != 1:
                raise Exception("Query did not return expected value")
            return {"success": True}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_datahub_config(self, db_path) -> dict[str, Any]:
        pass

    def add_detail(self, detail):
        detail.resource = self.resource
        detail.save()

    @contextmanager
    def datahub_yaml_path(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            db_path, config_path = self.db_config_paths(temp_dir)
            # add in dbt configs to same ingest
            config = self.get_datahub_config(db_path)
            with open(config_path, "w") as f:
                yaml.dump(config, f)
            yield [config_path], db_path


class DBTResource(PolymorphicModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, null=True)
    name = models.TextField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    creator = models.ForeignKey(
        "User", on_delete=models.SET_NULL, null=True, default=None
    )
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, null=True)
    manifest_json = models.JSONField(null=True)
    catalog_json = models.JSONField(null=True)

    @classmethod
    def get_default_subtype(cls):
        return ResourceSubtype.DBT


## BI polymorphisms
class LookerDetails(ResourceDetails):
    subtype = models.CharField(max_length=255, default=ResourceSubtype.LOOKER)
    base_url = encrypt(models.URLField(blank=False))
    client_id = encrypt(models.CharField(max_length=255, blank=False))
    client_secret = encrypt(models.CharField(max_length=255, blank=False))
    github_repo_id = encrypt(models.CharField(max_length=255, null=True))
    project_path = models.CharField(max_length=255, null=True)

    # relationships
    repository = models.ForeignKey(
        Repository, on_delete=models.CASCADE, null=True, default=None
    )

    @property
    def datahub_extras(self):
        return ["looker", "lookml"]

    @property
    def datahub_db_nickname(self):
        return "looker"

    def get_datahub_config(self, db_path) -> dict[str, Any]:
        return {
            "source": {
                "type": "looker",
                "config": {
                    "base_url": self.base_url,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                },
            },
            "sink": get_sync_config(db_path),
        }

    # special config function for lookml. Looker uses two separate processing steps
    def get_datahub_config_lookml(self, db_path, project_path) -> dict[str, Any]:
        return {
            "source": {
                "type": "lookml",
                "config": {
                    "base_folder": project_path,
                    "api": {
                        "base_url": self.base_url,
                        "client_id": self.client_id,
                        "client_secret": self.client_secret,
                    },
                },
            },
            "sink": get_sync_config(db_path),
        }

    @contextmanager
    def datahub_yaml_path(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            db_path, config_path = self.db_config_paths(temp_dir)
            config = self.get_datahub_config(db_path)
            with open(config_path, "w") as f:
                yaml.dump(config, f)

            if self.project_path is None:
                yield [config_path], db_path

            else:
                # add in lookml configs, may need to use github
                with repo_path(self, isolate=True) as (project_path, _):
                    config_path_lookml = os.path.join(temp_dir, "lookml.yml")
                    config_lookml = self.get_datahub_config_lookml(
                        db_path, project_path
                    )
                    with open(config_path_lookml, "w") as f:
                        yaml.dump(config_lookml, f)

                    yield [config_path, config_path_lookml], db_path


class TableauDetails(ResourceDetails):
    subtype = models.CharField(max_length=255, default=ResourceSubtype.TABLEAU)
    connect_uri = encrypt(models.CharField(max_length=255, blank=False))
    site = encrypt(models.CharField(max_length=255, default="", blank=True))
    username = encrypt(models.CharField(max_length=255, blank=False))
    password = encrypt(models.CharField(max_length=255, blank=False))

    @property
    def datahub_extras(self):
        return ["tableau"]

    @contextmanager
    def datahub_yaml_path(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            db_path, config_path = self.db_config_paths(temp_dir)
            config = {
                "source": {
                    "type": "tableau",
                    "config": {
                        "connect_uri": self.connect_uri,
                        "site": self.site or "",
                        "username": self.username,
                        "password": self.password,
                    },
                },
                "sink": get_sync_config(db_path),
            }
            with open(config_path, "w") as f:
                yaml.dump(config, f)
            yield [config_path], db_path


class MetabaseDetails(ResourceDetails):
    subtype = models.CharField(max_length=255, default=ResourceSubtype.METABASE)
    username = encrypt(models.CharField(max_length=255, blank=False))
    password = encrypt(models.CharField(max_length=255, blank=False))
    connect_uri = encrypt(models.CharField(blank=False, max_length=255))
    api_key = encrypt(models.CharField(max_length=255, blank=True, null=True))
    jwt_shared_secret = encrypt(models.CharField(max_length=255, blank=True, null=True))

    @property
    def datahub_extras(self):
        return ["metabase"]

    @contextmanager
    def datahub_yaml_path(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            db_path, config_path = self.db_config_paths(temp_dir)
            config = {
                "source": {
                    "type": "metabase",
                    "config": {
                        "connect_uri": self.connect_uri,
                        "username": self.username,
                        "password": self.password,
                    },
                },
                "sink": get_sync_config(db_path),
            }
            with open(config_path, "w") as f:
                yaml.dump(config, f)
            yield [config_path], db_path


class PowerBIDetails(ResourceDetails):
    subtype = models.CharField(max_length=255, default=ResourceSubtype.POWERBI)
    client_id = encrypt(models.CharField(max_length=255, blank=False))
    client_secret = encrypt(models.CharField(max_length=255, blank=False))
    powerbi_workspace_id = encrypt(models.CharField(max_length=255, blank=False))
    powerbi_tenant_id = encrypt(models.CharField(max_length=255, blank=False))

    @property
    def datahub_extras(self):
        return ["powerbi"]

    @contextmanager
    def datahub_yaml_path(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            db_path, config_path = self.db_config_paths(temp_dir)
            config = {
                "source": {
                    "type": "powerbi",
                    "config": {
                        "client_id": self.client_id,
                        "client_secret": self.client_secret,
                        "workspace_id_pattern": {"allow": [self.powerbi_workspace_id]},
                        "tenant_id": self.powerbi_tenant_id,
                        "extract_dashboards": True,
                        "extract_dataset_schema": True,
                        "include_workspace_name_in_dataset_urn": True,
                        "profiling": {"enabled": False},
                        "extract_column_level_lineage": True,
                    },
                },
                "sink": get_sync_config(db_path),
            }
            with open(config_path, "w") as f:
                yaml.dump(config, f)
            yield [config_path], db_path


## DBT polymorphisms
class DBTCoreDetails(DBTResource):
    subtype = models.CharField(max_length=255, default=ResourceSubtype.DBT)
    project_path = models.CharField(max_length=255, blank=False)
    database = encrypt(models.CharField(max_length=255, blank=False))
    schema = encrypt(models.CharField(max_length=255, blank=False))
    other_schemas = encrypt(models.JSONField(null=True))
    threads = models.IntegerField(null=True, default=1)
    version = models.CharField(
        choices=[(v, v.value) for v in DBTVersion], max_length=255, blank=False
    )
    env_vars = encrypt(models.JSONField(null=True))

    # relationships
    repository = models.ForeignKey(
        Repository, on_delete=models.CASCADE, null=True, default=None
    )

    def save(self, *args, **kwargs):
        if isinstance(self.version, DBTVersion):
            self.version = self.version.value
        super().save(*args, **kwargs)

    @contextmanager
    def dbt_repo_context(self, isolate: bool = False, branch_id: str | None = None):
        env_vars = self.env_vars or {}
        dialect_str = self.resource.details.subtype
        with repo_path(self, isolate=isolate, branch_id=branch_id) as (
            project_path,
            git_repo,
        ):
            dbt_project_yml_path = os.path.join(project_path, "dbt_project.yml")
            with open(dbt_project_yml_path, "r") as f:
                contents = yaml.load(f, Loader=yaml.FullLoader)
                profile_name = contents["profile"]
            with tempfile.TemporaryDirectory() as dbt_profiles_dir:
                dbt_profiles_path = os.path.join(dbt_profiles_dir, "profiles.yml")
                with open(dbt_profiles_path, "w") as f:
                    profile_contents = self.resource.details.get_dbt_profile_contents(
                        self
                    )
                    adj_profile_contents = {profile_name: profile_contents}
                    yaml.dump(adj_profile_contents, f)
                yield (
                    DBTProject(
                        project_path,
                        DBTDialect._value2member_map_[dialect_str],
                        self.version,
                        dbt_profiles_dir=dbt_profiles_dir,
                        env_vars={} if env_vars is None else env_vars,
                    ),
                    project_path,
                    git_repo,
                )

    @contextmanager
    def dbt_transition_context(
        self, isolate: bool = False, branch_id: str | None = None
    ):
        with self.dbt_repo_context(isolate=isolate) as (
            before,
            _,
            _,
        ):
            with self.dbt_repo_context(isolate=isolate, branch_id=branch_id) as (
                after,
                project_path,
                git_repo,
            ):
                yield (
                    DBTTransition(before_project=before, after_project=after),
                    project_path,
                    git_repo,
                )

    def upload_artifacts(self, branch_id: str | None = None):
        with self.dbt_repo_context(isolate=True, branch_id=branch_id) as (
            dbtproj,
            project_path,
            _,
        ):
            stdout, stderr, success = dbtproj.dbt_compile(
                models_only=True, update_manifest=True
            )
            if not success:
                raise Exception(
                    f"Error compiling dbt code. Stderr: {stderr}. Stdout: {stdout}"
                )
            stdout, stderr, success = dbtproj.dbt_docs_generate()
            if not success:
                raise Exception(
                    f"Error generating docs. Stderr: {stderr}. Stdout: {stdout}"
                )
            dbtproj.mount_manifest()
            dbtproj.mount_catalog()
            self.manifest_json = dbtproj.manifest
            self.catalog_json = dbtproj.catalog
            self.save()

    @contextmanager
    def datahub_yaml_path(self, db_path):
        with tempfile.TemporaryDirectory() as artifact_dir:
            manifest_path = os.path.join(artifact_dir, "manifest.json")
            catalog_path = os.path.join(artifact_dir, "catalog.json")
            save_orjson(manifest_path, self.manifest_json)
            save_orjson(catalog_path, self.catalog_json)
            with tempfile.TemporaryDirectory() as temp_dir:
                config_path = os.path.join(temp_dir, "dbt.yml")
                config = {
                    "source": {
                        "type": "dbt",
                        "config": {
                            "manifest_path": manifest_path,
                            "catalog_path": catalog_path,
                            "target_platform": self.resource.details.subtype,
                            "write_semantics": "override",
                            "include_column_lineage": False,
                        },
                    },
                    "sink": get_sync_config(db_path),
                }
                with open(config_path, "w") as f:
                    yaml.dump(config, f)
                yield [config_path]


class DBTCloudDetails(DBTResource):
    subtype = models.CharField(max_length=255, default=ResourceSubtype.DBT_CLOUD)
    api_token = encrypt(models.CharField(max_length=255, blank=False))
    account_id = encrypt(models.CharField(max_length=255, blank=False))
    project_id = encrypt(models.CharField(max_length=255, blank=False))


## DB polymorphisms
class DBDetails(ResourceDetails):
    lookback_days = models.IntegerField(default=1)
    database_include = ArrayField(models.CharField(max_length=255), null=True)
    database_exclude = ArrayField(models.CharField(max_length=255), null=True)
    schema_include = ArrayField(models.CharField(max_length=255), null=True)
    schema_exclude = ArrayField(models.CharField(max_length=255), null=True)
    table_include = ArrayField(models.CharField(max_length=255), null=True)
    table_exclude = ArrayField(models.CharField(max_length=255), null=True)
    use_only_dbt_schemas = models.BooleanField(default=False)

    @property
    def requires_start_date(self):
        return True

    @property
    def allows_db_exclusions(self):
        return False

    @property
    def schema_terminology(self):
        return "schema"

    def get_dbt_profile_contents(self, dbt_core_resource: DBTCoreDetails):
        pass

    @contextmanager
    def dbt_datahub_yml_paths(self, dbtresources: list[DBTResource], db_path):
        if len(dbtresources) == 0:
            yield []
            return

        with dbtresources[0].datahub_yaml_path(db_path) as config_paths:
            with self.dbt_datahub_yml_paths(
                dbtresources[1:], db_path
            ) as other_config_paths:
                yield config_paths + other_config_paths

    def add_patterns_to_datahub_config(self, config):
        config_subset = config["source"]["config"]
        if self.allows_db_exclusions:
            if self.database_include is not None:
                config_subset.setdefault("schema_pattern", {}).setdefault(
                    "allow", self.database_include
                )
            if self.database_exclude is not None:
                config_subset.setdefault("schema_pattern", {}).setdefault(
                    "deny", self.database_exclude
                )

        if self.schema_include is not None or self.use_only_dbt_schemas:
            config_subset.setdefault("schema_pattern", {}).setdefault(
                "allow", self.schema_include or []
            )
        if self.schema_exclude is not None:
            config_subset.setdefault("schema_pattern", {}).setdefault(
                "deny", self.schema_exclude
            )
        if self.table_include is not None:
            config_subset.setdefault("table_pattern", {}).setdefault(
                "allow", self.table_include
            )
        if self.table_exclude is not None:
            config_subset.setdefault("table_pattern", {}).setdefault(
                "deny", self.table_exclude
            )

    @contextmanager
    def datahub_yaml_path(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            db_path, config_path = self.db_config_paths(temp_dir)
            # add in dbt configs to same ingest, only supports dbt core for now
            dbt_resources: list[DBTCoreDetails] = list(
                self.resource.dbtresource_set.all()
            )
            with self.dbt_datahub_yml_paths(dbt_resources, db_path) as dbt_yaml_paths:
                config = self.get_datahub_config(db_path)
                self.add_patterns_to_datahub_config(config)
                base_config = config["source"]["config"]
                schema_pattern = base_config.get("schema_pattern", {})
                allow_list = schema_pattern.get("allow")
                # add dbt schemas to allow list if not pulling from all schemas
                if allow_list is not None:
                    schema_pattern.setdefault("allow", [])
                    for dbt in dbt_resources:
                        schema_pattern["allow"].append(dbt.schema)
                        if dbt.other_schemas is not None:
                            schema_pattern["allow"].extend(dbt.other_schemas)
                        schema_pattern["allow"] = list(set(schema_pattern["allow"]))

                # use dataset terminology if appropriate
                if (
                    self.schema_terminology != "schema"
                    and "schema_pattern" in base_config
                ):
                    base_config[f"{self.schema_terminology}_pattern"] = base_config.pop(
                        "schema_pattern"
                    )

                # save and yield the config file
                with open(config_path, "w") as f:
                    yaml.dump(config, f)
                yield [config_path, *dbt_yaml_paths], db_path


class PostgresDetails(DBDetails):
    subtype = models.CharField(max_length=255, default=ResourceSubtype.POSTGRES)
    host = encrypt(models.CharField(max_length=255, blank=False))
    port = models.IntegerField(blank=False)
    database = encrypt(models.CharField(max_length=255, blank=False))
    username = encrypt(models.CharField(max_length=255, blank=False))
    password = encrypt(models.CharField(max_length=255, blank=False))

    @property
    def requires_start_date(self):
        return False

    @property
    def datahub_extras(self):
        return ["postgres", "dbt"]

    def get_connector(self):
        return PostgresConnector(
            host=self.host,
            port=self.port,
            user=self.username,
            password=self.password,
            tables=[f"{self.database}.*.*"],
        )

    def get_datahub_config(self, db_path) -> dict[str, Any]:
        return {
            "source": {
                "type": "postgres",
                "config": {
                    "host_port": f"{self.host}:{self.port}",
                    "database": self.database,
                    "username": self.username,
                    "password": self.password,
                },
            },
            "sink": get_sync_config(db_path),
        }

    def get_dbt_profile_contents(self, dbt_core_resource: DBTCoreDetails):
        if dbt_core_resource.database != self.database:
            raise Exception(
                f"DBT database {dbt_core_resource.database} does not match Postgres database {self.database}"
            )
        return {
            "target": "prod",
            "outputs": {
                "prod": {
                    "type": "postgres",
                    "host": self.host,
                    "port": self.port,
                    "dbname": self.database,
                    "schema": dbt_core_resource.schema,
                    "user": self.username,
                    "password": self.password,
                }
            },
        }


class RedshiftDetails(DBDetails):
    subtype = models.CharField(max_length=255, default=ResourceSubtype.REDSHIFT)
    host = encrypt(models.CharField(max_length=255, blank=False))
    port = models.IntegerField(blank=False)
    database = encrypt(models.CharField(max_length=255, blank=False))
    username = encrypt(models.CharField(max_length=255, blank=False))
    password = encrypt(models.CharField(max_length=255, blank=False))
    serverless = models.BooleanField(null=False)

    @property
    def requires_start_date(self):
        return False

    @property
    def datahub_extras(self):
        return ["redshift", "dbt"]

    def get_connector(self):
        return RedshiftConnector(
            host=self.host,
            port=self.port,
            user=self.username,
            password=self.password,
            tables=[f"{self.database}.*.*"],
        )

    def get_datahub_config(self, db_path) -> dict[str, Any]:
        return {
            "source": {
                "type": "redshift",
                "config": {
                    "host_port": f"{self.host}:{self.port}",
                    "database": self.database,
                    "username": self.username,
                    "password": self.password,
                    "is_serverless": self.serverless,
                    "include_table_lineage": False,
                    "include_table_location_lineage": False,
                    "include_table_rename_lineage": False,
                    "include_unload_lineage": False,
                    "include_view_lineage": False,
                    "include_view_column_lineage": False,
                    "include_usage_statistics": False,
                },
            },
            "sink": get_sync_config(db_path),
        }

    def get_dbt_profile_contents(self, dbt_core_resource: DBTCoreDetails):
        if dbt_core_resource.database != self.database:
            raise Exception(
                f"DBT database {dbt_core_resource.database} does not match Postgres database {self.database}"
            )
        return {
            "target": "prod",
            "outputs": {
                "prod": {
                    "type": "redshift",
                    "host": self.host,
                    "port": self.port,
                    "dbname": self.database,
                    "schema": dbt_core_resource.schema,
                    "user": self.username,
                    "password": self.password,
                }
            },
        }


class BigqueryDetails(DBDetails):
    subtype = models.CharField(max_length=255, default=ResourceSubtype.BIGQUERY)
    service_account = encrypt(models.JSONField())

    @property
    def service_account_dict(self):
        if isinstance(self.service_account, str):
            try:
                return json.loads(self.service_account)
            except json.JSONDecodeError:
                raise ValidationError("Invalid JSON in service_account")
        return self.service_account

    @property
    def schema_terminology(self):
        return "dataset"

    @property
    def datahub_extras(self):
        return ["bigquery", "dbt"]

    def get_connector(self):
        project_id = self.service_account_dict.get("project_id")
        assert project_id, "project_id is required in service_account"
        return BigQueryConnector(
            service_account_info=self.service_account_dict,
            tables=[f"{self.service_account_dict['project_id']}.*.*"],
        )

    def get_datahub_config(self, db_path):
        service_account = self.service_account_dict.copy()
        service_account.pop("universe_domain", None)
        return {
            "source": {
                "type": "bigquery",
                "config": {
                    "start_time": f"-{self.lookback_days}d",
                    "credential": service_account,
                    "project_ids": [service_account["project_id"]],
                    "include_table_lineage": False,
                    "include_table_location_lineage": False,
                    "include_view_lineage": False,
                    "include_view_column_lineage": False,
                    "include_table_snapshots": False,
                    "include_usage_statistics": False,
                },
            },
            "sink": get_sync_config(db_path),
        }

    def get_dbt_profile_contents(self, dbt_core_resource: DBTCoreDetails):
        return {
            "target": "prod",
            "outputs": {
                "prod": {
                    "type": "bigquery",
                    "method": "service-account-json",
                    "project": dbt_core_resource.database,
                    "schema": dbt_core_resource.schema,
                    "keyfile_json": self.service_account_dict,
                    "threads": dbt_core_resource.threads,
                }
            },
        }


class SnowflakeDetails(DBDetails):
    subtype = models.CharField(max_length=255, default=ResourceSubtype.SNOWFLAKE)
    account = encrypt(models.CharField(max_length=255, blank=False))
    warehouse = encrypt(models.CharField(max_length=255, blank=False))
    username = encrypt(models.CharField(max_length=255, blank=False))
    password = encrypt(models.CharField(max_length=255, blank=False))
    role = models.CharField(max_length=255, blank=False)

    @property
    def datahub_extras(self):
        return ["snowflake", "dbt"]

    def get_connector(self):
        return SnowflakeConnector(
            account=self.account,
            user=self.username,
            password=self.password,
            warehouse=self.warehouse,
            tables=["*.*.*"],
        )

    def get_datahub_config(self, db_path):
        config = {
            "source": {
                "type": "snowflake",
                "config": {
                    "start_time": f"-{self.lookback_days}d",
                    "account_id": self.account,
                    "username": self.username,
                    "password": self.password,
                    "include_table_lineage": False,
                    "include_table_location_lineage": False,
                    "include_view_lineage": False,
                    "include_view_column_lineage": False,
                    "include_usage_stats": False,
                },
            },
            "sink": get_sync_config(db_path),
        }
        if self.warehouse:
            config["source"]["config"]["warehouse"] = self.warehouse
        if self.role:
            config["source"]["config"]["role"] = self.role
        return config

    def get_dbt_profile_contents(self, dbt_core_resource: DBTCoreDetails):
        return {
            "target": "prod",
            "outputs": {
                "prod": {
                    "type": "snowflake",
                    "account": self.account,
                    "database": dbt_core_resource.database,
                    "schema": dbt_core_resource.schema,
                    "user": self.username,
                    "password": self.password,
                    "threads": dbt_core_resource.threads,
                }
            },
        }


class DatabricksDetails(DBDetails):
    subtype = models.CharField(max_length=255, default=ResourceSubtype.DATABRICKS)
    host = encrypt(models.CharField(max_length=255, blank=False))
    token = encrypt(models.CharField(max_length=255, blank=False))
    http_path = encrypt(models.CharField(max_length=255, blank=False))

    @property
    def datahub_extras(self):
        return ["databricks", "dbt"]

    @property
    def schema_terminology(self):
        return "catalog"

    def get_connector(self):
        return DatabricksConnector(
            host=self.host,
            token=self.token,
            http_path=self.http_path,
            tables=["*.*.*"],
        )

    def get_datahub_config(self, db_path):
        return {
            "source": {
                "type": "databricks",
                "config": {
                    "start_time": f"-{self.lookback_days}d",
                    "workspace_url": f"https://{self.host}",
                    "token": self.token,
                    "warehouse_id": self.http_path.split("/")[-1],
                    "include_table_lineage": False,
                    "include_table_location_lineage": False,
                    "include_view_lineage": False,
                    "include_view_column_lineage": False,
                    "include_usage_statistics": False,
                },
            },
            "sink": get_sync_config(db_path),
        }

    def get_dbt_profile_contents(self, dbt_core_resource: DBTCoreDetails):
        return {
            "target": "prod",
            "outputs": {
                "prod": {
                    "type": "databricks",
                    "token": self.token,
                    "host": self.host,
                    "http_path": self.http_path,
                    "catalog": dbt_core_resource.database,
                    "schema": dbt_core_resource.schema,
                }
            },
        }


class DuckDBDetails(DBDetails):
    subtype = models.CharField(max_length=255, default=ResourceSubtype.DUCKDB)
    # NOTE: only works for duckdb files in the docker container for now, not S3
    path = encrypt(models.TextField(blank=False))

    @property
    def datahub_extras(self):
        return ["sqlalchemy", "dbt"]

    @property
    def datahub_db_nickname(self):
        return "duckdb"

    def get_connector(self):
        return DatabaseFileConnector(path=self.path)

    def get_datahub_config(self, db_path) -> dict[str, Any]:
        return {
            "source": {
                "type": "sqlalchemy",
                "config": {
                    "connect_uri": f"datahub:///{self.path}",
                    "platform": "duckdb",
                },
            },
            "sink": get_sync_config(db_path),
        }

    def get_dbt_profile_contents(self, dbt_core_resource: DBTCoreDetails):
        return {
            "target": "dev",
            "outputs": {"dev": {"type": "duckdb", "path": self.path}},
        }


class DataFileDetails(ResourceDetails):
    subtype = models.CharField(max_length=255, default=ResourceSubtype.FILE)
    path = models.TextField(blank=False)
