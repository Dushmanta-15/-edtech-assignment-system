from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Submission
from .serializers import SubmissionSerializer

class IsStudentOrTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['STUDENT', 'TEACHER']
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'TEACHER':
            return obj.assignment.teacher == request.user
        return obj.student == request.user

class SubmissionListCreateView(generics.ListCreateAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudentOrTeacher]
    
    def get_queryset(self):
        if self.request.user.role == 'TEACHER':
            return Submission.objects.filter(assignment__teacher=self.request.user)
        return Submission.objects.filter(student=self.request.user)

class SubmissionDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudentOrTeacher]
    
    def get_queryset(self):
        if self.request.user.role == 'TEACHER':
            return Submission.objects.filter(assignment__teacher=self.request.user)
        return Submission.objects.filter(student=self.request.user)
