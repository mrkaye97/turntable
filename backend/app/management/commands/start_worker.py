import subprocess

from django.core.management.base import BaseCommand

BASE_CELERY_COMMAND = "celery -A api worker -E --loglevel=info"
EXCLUDE_PATHS = ["/code/media/ws/"]


class Command(BaseCommand):
    help = "Start the Django development worker."

    def add_arguments(self, parser):
        parser.add_argument(
            "--mode", choices=["demo", "dev", "dev-internal", "staging"]
        )
        parser.add_argument("--concurrency", type=int, default=1)


    def handle(self, *args, **options):
        celery_command = BASE_CELERY_COMMAND+ f" --concurrency={options['concurrency']}"
        subprocess.run(celery_command, shell=True)