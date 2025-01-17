import os
import subprocess

from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Start flower"

    def handle(self, *args, **kwargs):
        superuser_email = os.environ.get("SUPERUSER_EMAIL")
        superuser_password = os.environ.get("SUPERUSER_PASSWORD")

        command = [
            "celery",
            f"--broker={settings.CELERY_BROKER_URL}",
            "flower",
            f"--basic-auth={superuser_email}:{superuser_password}",
            "--loglevel=none",
        ]

        subprocess.run(command)
