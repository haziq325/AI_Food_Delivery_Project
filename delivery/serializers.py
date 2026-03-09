from rest_framework import serializers
from .models import MapNode, Restaurant, MenuItem

# For the AI Lead: Map Coordinates
class MapNodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MapNode
        fields = '__all__'

# For the UI Lead: Restaurant Menus
class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'price', 'description', 'category']

class RestaurantSerializer(serializers.ModelSerializer):
    # This nests the menu items directly inside the restaurant object
    menu_items = MenuItemSerializer(many=True, read_only=True, source='menuitem_set')

    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'address', 'rating', 'menu_items']