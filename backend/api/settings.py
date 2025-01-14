"""
Django settings for api project.

Generated by 'django-admin startproject' using Django 5.0.6.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""

import os
from datetime import timedelta
from pathlib import Path

import dj_database_url

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "django-insecure-i7pd5iwtuo*0h9je%(n1!u8srlbka$^do)c(#y88h9grhilq3@",
)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["localhost", "api"]
backend_host = os.getenv("BACKEND_HOST")

if backend_host:
    if "https://" in backend_host:
        backend_host = backend_host.replace("https://", "")
    elif "http://" in backend_host:
        backend_host = backend_host.replace("http://", "")
    ALLOWED_HOSTS = [backend_host] + ALLOWED_HOSTS

# Application definition

INSTALLED_APPS = [
    "corsheaders",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.postgres",
    "django.contrib.sites",
    "rest_framework",
    "djoser",
    "invitations",
    "storages",
    "polymorphic",
    "adrf",
    "rest_framework_simplejwt.token_blacklist",
    "channels",
    "health_check",
    "health_check.db",
    "health_check.contrib.migrations",
    "django_celery_results",
    "django_celery_beat",
    "app",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "django.middleware.gzip.GZipMiddleware",
]
GZIP_MIN_LENGTH = 1200

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://app.turntable.so",
]

frontend_hosts = os.getenv("FRONTEND_HOST")
if frontend_hosts:
    frontend_hosts = frontend_hosts.split(",")
    for frontend_host in frontend_hosts:
        CORS_ALLOWED_ORIGINS = [frontend_host] + CORS_ALLOWED_ORIGINS


ROOT_URLCONF = "api.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, "templates")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "api.wsgi.application"
ASGI_APPLICATION = "api.asgi.application"


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases


if os.getenv("LOCAL_DB") == "true":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("POSTGRES_DB"),
            "USER": os.getenv("POSTGRES_USER"),
            "PASSWORD": os.getenv("POSTGRES_PASSWORD"),
            "HOST": os.getenv("POSTGRES_HOST"),
            "PORT": os.getenv("POSTGRES_PORT"),
            "TEST": {
                "NAME": "test_db",
            },
        }
    }
else:
    DATABASES = {
        "default": dj_database_url.config(
            conn_max_age=600,
            conn_health_checks=True,
        ),
    }

if os.getenv("LOCAL_HOST") == "true":
    FE_URL = "http://localhost:3000/"
else:
    FE_URL = "https://app.turntable.so/"


# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = "static/"

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=2),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "UPDATE_LAST_LOGIN": True,
    "SIGNING_KEY": SECRET_KEY,
    "ALGORITHM": "HS512",
}

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

AUTH_USER_MODEL = "app.User"
DJOSER = {
    "PASSWORD_RESET_CONFIRM_URL": "auth/password/reset-password-confirmation/?uid={uid}&token={token}",
    "ACTIVATION_URL": "#/activate/{uid}/{token}",
    "SEND_ACTIVATION_EMAIL": False,
    "SERIALIZERS": {},
    "LOGIN_FIELD": "email",
    "SERIALIZERS": {
        "user_create": "api.serializers.CustomUserCreateSerializer",
        "token_create": "djoser.serializers.TokenCreateSerializer",
        "user": "api.serializers.UserSerializer",
        "current_user": "api.serializers.UserSerializer",
        "user_delete": "djoser.serializers.UserDeleteSerializer",
    },
}

SITE_ID = 1
SITE_NAME = "Turntable"
DOMAIN = "localhost:3000"
ACCOUNT_EMAIL_REQUIRED = False
ACCOUNT_EMAIL_VERIFICATION = "none"

ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
        },
    },
}

STORAGES = {
    "default": {
        "BACKEND": "storages.backends.s3.S3Storage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

AWS_S3_ACCESS_KEY_ID = os.getenv("AWS_S3_ACCESS_KEY_ID")
AWS_S3_SECRET_ACCESS_KEY = os.getenv("AWS_S3_SECRET_ACCESS_KEY")
AWS_STORAGE_BUCKET_NAME = os.getenv("AWS_STORAGE_BUCKET_NAME")
if "AWS_S3_ENDPOINT_URL" in os.environ:
    AWS_S3_ENDPOINT_URL = os.getenv("AWS_S3_ENDPOINT_URL")
elif "AWS_S3_ENDPOINT_HOST" in os.environ and "AWS_S3_ENDPOINT_PORT" in os.environ:
    AWS_S3_ENDPOINT_URL = f"http://{os.getenv('AWS_S3_ENDPOINT_HOST')}:{os.getenv('AWS_S3_ENDPOINT_PORT')}"
else:
    AWS_S3_ENDPOINT_URL = None


AWS_DEFAULT_ACL = None
AWS_QUERYSTRING_AUTH = True
AWS_QUERYSTRING_EXPIRE = 60

AWS_S3_PUBLIC_URL = (
    os.getenv("AWS_S3_PUBLIC_URL")
    if os.getenv("AWS_S3_PUBLIC_URL")
    else "http://localhost:9000"
)
AWS_S3_SIGNATURE_VERSION = "s3v4"

if region := os.getenv("AWS_S3_REGION_NAME"):
    AWS_S3_REGION_NAME = region

PUBLIC_MEDIA_LOCATION = "public-assets"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")
MEDIA_URL = "/media/"

if acl := os.getenv("AWS_DEFAULT_ACL"):
    AWS_DEFAULT_ACL = None if acl == "None" else acl
if querystring_auth := os.getenv("AWS_QUERYSTRING_AUTH"):
    AWS_QUERYSTRING_AUTH = True if querystring_auth == "true" else False
if overwrite := os.getenv("AWS_S3_FILE_OVERWRITE"):
    AWS_S3_FILE_OVERWRITE = True if overwrite == "true" else False

# static site settings
STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

# redis settings
CACHE_REDIS_CHANNEL = os.getenv("CACHE_CHANNEL", "1")
CHANNEL_REDIS_CHANNEL = os.getenv("CHANNEL_REDIS_CHANNEL", "2")
CELERY_REDIS_CHANNEL = os.getenv("CELERY_REDIS_CHANNEL", "3")

if os.getenv("LOCAL_REDIS") == "true":
    redis_host = os.getenv("REDIS_HOST", "localhost")
    redis_port = int(os.getenv("REDIS_PORT", 6379))
    redis_url = f"redis://{redis_host}:{redis_port}/"
else:
    redis_url = f"{os.getenv('REDIS_URL')}/" # we add a / cause Render injects the url without a /
    if not redis_url:
        raise ValueError("REDIS_URL is required if LOCAL_REDIS is not set to true")

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {"hosts": [(redis_url) + CHANNEL_REDIS_CHANNEL]},
    }
}

## django cache settings
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": redis_url + CACHE_REDIS_CHANNEL,
    }
}

## Celery settings
CELERY_BROKER_URL = redis_url + CELERY_REDIS_CHANNEL
# CELERY_CACHE_BACKEND = "django-cache"
CELERY_RESULT_BACKEND = "django-db"
CELERY_ACCEPT_CONTENT = ["application/json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = "UTC"  # Adjust to your timezone
CELERY_TASK_TRACK_STARTED = True
CELERY_RESULT_EXTENDED = True
