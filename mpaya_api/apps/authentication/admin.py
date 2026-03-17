from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display    = ['username', 'email', 'role', 'is_active', 'date_joined']
    list_filter     = ['role', 'is_active']
    search_fields   = ['username', 'email']
    readonly_fields = ['id', 'date_joined']
    ordering        = ['-date_joined']