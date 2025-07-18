from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from .models import Assignment
from .serializers import AssignmentSerializer
from apps.submissions.models import Submission
from apps.submissions.serializers import SubmissionSerializer

class IsTeacherOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == 'TEACHER'

class AssignmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacherOrReadOnly]
    
    def get_queryset(self):
        if self.request.user.role == 'TEACHER':
            return Assignment.objects.filter(teacher=self.request.user)
        return Assignment.objects.all()

class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'TEACHER':
            return Assignment.objects.filter(teacher=self.request.user)
        return Assignment.objects.all()

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def assignment_submissions(request, assignment_id):
    assignment = get_object_or_404(Assignment, id=assignment_id)
    
    # Only teachers can view submissions, and only for their assignments
    if request.user.role != 'TEACHER' or assignment.teacher != request.user:
        return Response({'error': 'Permission denied'}, status=403)
    
    submissions = Submission.objects.filter(assignment=assignment)
    serializer = SubmissionSerializer(submissions, many=True)
    return Response(serializer.data)
