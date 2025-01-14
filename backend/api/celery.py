import os

from celery import Celery
from django.conf import settings  # noqa: F401

# Set the default Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "api.settings")

# Create the Celery app
app = Celery("api")

# Load configuration from Django settings
app.config_from_object(
    f"django.conf:{settings.__class__.__name__.lower()}", namespace="CELERY"
)


# Auto-discover tasks in all installed apps
app.autodiscover_tasks()
