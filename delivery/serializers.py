from rest_framework import serializers
from .models import MapNode, MapEdge, Restaurant

class MapNodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MapNode
        fields = '__all__'

class MapEdgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MapEdge
        fields = '__all__'