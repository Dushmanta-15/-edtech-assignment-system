from django.contrib import admin
from .models import Submission

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ['assignment', 'student', 'submitted_at', 'grade']
    list_filter = ['assignment', 'student', 'submitted_at', 'grade']
    search_fields = ['assignment__title', 'student__email', 'content']
    ordering = ['-submitted_at']
    readonly_fields = ['submitted_at']
