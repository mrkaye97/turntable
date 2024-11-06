import os
import shutil
import tempfile
from unittest.mock import patch

from app.utils.test_utils import require_env_vars
import pytest
from django.conf import settings

from app.models import Workspace
from app.models.repository import Branch
from app.models.ssh_key import SSHKey
from app.models.workspace import generate_short_uuid

TEST_WORKSPACE_ID = generate_short_uuid()


isolate_mark = pytest.mark.parametrize(
    "isolate", [True, False] if not os.getenv("GITHUB_RUN_ID") else [True]
)


@pytest.mark.django_db
@require_env_vars("SSHKEY_0_PUBLIC", "SSHKEY_0_PRIVATE")
class TestRepository:
    @pytest.fixture(scope="session", autouse=True)
    def run_command_after_tests(request):
        yield
        # This will run after all tests are completed
        path_to_delete = os.path.join(settings.MEDIA_ROOT, "ws", TEST_WORKSPACE_ID)
        if os.path.exists(path_to_delete):
            shutil.rmtree(path_to_delete)

    @pytest.fixture
    def local_postgres_repo(self, local_postgres):
        repo = local_postgres.dbtresource_set.first().repository
        return repo

    @pytest.fixture
    def local_postgres_test_branch(self, local_postgres_repo):
        return Branch.objects.create(
            workspace=local_postgres_repo.workspace,
            repository=local_postgres_repo,
            branch_name="test-branch",
        )

    def test_repo_connection(self, local_postgres_repo):
        res = local_postgres_repo.test_remote_repo_connection()
        assert res["success"]

    def test_clone(self, local_postgres_repo):
        assert local_postgres_repo.main_branch.clone()

    @isolate_mark
    def test_repo_context(self, local_postgres_repo, isolate):
        with local_postgres_repo.main_branch.repo_context(isolate=isolate) as (repo, _):
            assert len(os.listdir(repo.working_tree_dir)) > 3

    @isolate_mark
    def test_dbt_repo_context(self, local_postgres, isolate):
        with local_postgres.dbtresource_set.first().dbt_repo_context(
            isolate=isolate
        ) as (
            project,
            filepath,
            _,
        ):
            assert project != None
            assert filepath != None

    @isolate_mark
    def test_checkout(self, local_postgres_test_branch, isolate):
        with local_postgres_test_branch.repo_context(isolate=isolate) as (
            repo,
            env,
        ):
            assert (
                local_postgres_test_branch.checkout(isolate, repo, env)
                == local_postgres_test_branch.branch_name
            )

    def test_create_branch(self, local_postgres_repo):
        branch_name = "test_branch" + "".join([hex(x)[2:] for x in os.urandom(32)])
        branch = Branch.objects.create(
            workspace=local_postgres_repo.workspace,
            repository=local_postgres_repo,
            branch_name=branch_name,
        )
        assert (
            branch.create_git_branch(
                source_branch=local_postgres_repo.main_branch.branch_name
            )
            == branch_name
        )
        branch.clone()
        assert branch.checkout() == branch_name

    def test_pull(self, local_postgres_test_branch):
        assert local_postgres_test_branch.git_pull()

    def test_generate_deploy_key(self):
        workspace = Workspace.objects.create(
            id=TEST_WORKSPACE_ID + "1",
            name="Test workspace 1",
        )
        key = SSHKey.generate_deploy_key(workspace)
        assert key.public_key is not None
