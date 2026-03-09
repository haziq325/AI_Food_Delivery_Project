from rest_framework import generics
from .models import MapNode, Restaurant
from .serializers import MapNodeSerializer, RestaurantSerializer

# The Map API you did before
class MapNodeList(generics.ListAPIView):
    queryset = MapNode.objects.all()
    serializer_class = MapNodeSerializer

# The New Restaurant API for the UI lead
class RestaurantListView(generics.ListAPIView):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer