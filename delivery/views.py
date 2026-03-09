from django.shortcuts import render

from rest_framework import generics
from .models import MapNode, MapEdge
from .serializers import MapNodeSerializer, MapEdgeSerializer

class MapNodeList(generics.ListAPIView):
    queryset = MapNode.objects.all()
    serializer_class = MapNodeSerializer

class MapEdgeList(generics.ListAPIView):
    queryset = MapEdge.objects.all()
    serializer_class = MapEdgeSerializer
