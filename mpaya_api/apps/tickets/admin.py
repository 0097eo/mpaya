from django.contrib import admin
from .models import Ticket


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ['title', 'meter_serial_number', 'assigned_to', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'meter_serial_number', 'assigned_to__username']
    readonly_fields = ['id', 'resolved_at', 'created_at', 'updated_at']
    ordering = ['-created_at']
