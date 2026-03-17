import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ADMIN = 'admin'
    TECHNICIAN = 'technician'
    SUPPORT = 'support'

    ROLES = [
        (ADMIN, 'admin'),
        (TECHNICIAN, 'technician'),
        (SUPPORT, 'customer_support'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=30, choices=ROLES, default=TECHNICIAN)

    class Meta:
        db_table = 'users'
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.email} ({self.role})"