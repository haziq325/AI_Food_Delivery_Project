from rest_framework import generics
from .models import MapNode, Restaurant
from .serializers import MapNodeSerializer, RestaurantSerializer

# Endpoint for Map Nodes
class MapNodeList(generics.ListAPIView):
    queryset = MapNode.objects.all()
    serializer_class = MapNodeSerializer

# Endpoint for Restaurant List
class RestaurantListView(generics.ListAPIView):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer