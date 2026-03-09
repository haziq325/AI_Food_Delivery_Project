from rest_framework import serializers
from .models import MapNode, Restaurant, MenuItem, MapEdge

class MapNodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MapNode
        fields = '__all__'

class MapEdgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MapEdge
        fields = '__all__'

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = '__all__'

class RestaurantSerializer(serializers.ModelSerializer):
    # This grabs all the menu items linked to this restaurant
    menu_items = MenuItemSerializer(many=True, read_only=True, source='menuitem_set')
    
    class Meta:
        model = Restaurant
        fields = '__all__'
    