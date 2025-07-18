from rest_framework import serializers
from .models import Assignment
from apps.authentication.serializers import UserSerializer

class AssignmentSerializer(serializers.ModelSerializer):
    teacher = UserSerializer(read_only=True)
    
    class Meta:
        model = Assignment
        fields = ['id', 'title', 'description', 'due_date', 'teacher', 'created_at', 'updated_at']
        read_only_fields = ['teacher', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['teacher'] = self.context['request'].user
        return super().create(validated_data)
