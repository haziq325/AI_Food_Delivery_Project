from rest_framework import generics
from .models import MapNode, Restaurant
from .serializers import MapNodeSerializer, RestaurantSerializer

class MapNodeList(generics.ListCreateAPIView):
    queryset = MapNode.objects.all()
    serializer_class = MapNodeSerializer

# View for your 25 Karachi Restaurants
class RestaurantListView(generics.ListAPIView):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer