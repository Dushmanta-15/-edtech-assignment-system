from django.contrib import admin
from .models import Assignment

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ['title', 'teacher', 'due_date', 'created_at']
    list_filter = ['teacher', 'created_at', 'due_date']
    search_fields = ['title', 'description', 'teacher__email']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
