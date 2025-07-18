from rest_framework import serializers
from .models import Submission
from apps.assignments.serializers import AssignmentSerializer
from apps.authentication.serializers import UserSerializer

class SubmissionSerializer(serializers.ModelSerializer):
    assignment = AssignmentSerializer(read_only=True)
    student = UserSerializer(read_only=True)
    assignment_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Submission
        fields = ['id', 'assignment', 'assignment_id', 'student', 'content', 'file', 'submitted_at', 'grade', 'feedback']
        read_only_fields = ['student', 'submitted_at']
    
    def create(self, validated_data):
        validated_data['student'] = self.context['request'].user
        return super().create(validated_data)
