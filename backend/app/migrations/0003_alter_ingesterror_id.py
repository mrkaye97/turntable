# Generated by Django 5.0.6 on 2024-09-01 16:31

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("app", "0002_ingesterror"),
    ]

    operations = [
        migrations.AlterField(
            model_name="ingesterror",
            name="id",
            field=models.UUIDField(
                default=uuid.uuid4, editable=False, primary_key=True, serialize=False
            ),
        ),
    ]
