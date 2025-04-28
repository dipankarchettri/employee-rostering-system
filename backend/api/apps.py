from django.apps import AppConfig

class RosterConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        # Import here to avoid AppRegistryNotReady error
        from . import signals