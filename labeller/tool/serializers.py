from rest_framework import serializers
from labeller.tool.models import Document


class DocumentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Document
        fields = ('image', )

