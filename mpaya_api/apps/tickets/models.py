import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Ticket(models.Model):
    PENDING = 'pending'
    IN_PROGRESS = 'in_progress'
    RESOLVED = 'resolved'

    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (IN_PROGRESS, 'In Progress'),
        (RESOLVED, 'Resolved'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Ticket info
    title = models.CharField(max_length=255)
    description = models.TextField()
    meter_serial_number = models.CharField(max_length=100)

    # Assignment
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='assigned_tickets',
        limit_choices_to={'role': 'technician'}
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_tickets'
    )

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)

    # Resolution fields — only populated when resolved
    resolution_summary = models.TextField(blank=True)
    resolved_meter_serial = models.CharField(max_length=100, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tickets'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['assigned_to', 'status']),
            models.Index(fields=['assigned_to', 'created_at']),
        ]

    def __str__(self):
        return f"{self.title} — {self.status}"
